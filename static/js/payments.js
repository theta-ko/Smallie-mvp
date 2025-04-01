/**
 * Smallie - Payment Integration Module
 * Handles Flutterwave and Solana payment processing for contestant voting
 */

import {
    getFirestore,
    collection,
    doc,
    addDoc,
    updateDoc,
    increment,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

import { getAuth } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';

// Get Firebase instances
const db = getFirestore();
const auth = getAuth();

// DOM Elements
const voteModal = document.getElementById('vote-modal');
const flutterwavePayBtn = document.getElementById('pay-flutterwave');
const solanaPayBtn = document.getElementById('pay-solana');
const prizeFundDisplay = document.getElementById('prize-fund-display');

// Helpers
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0
    }).format(amount);
}

// Function to update prize fund display
export async function updatePrizeFund() {
    try {
        // Get total votes from all contestants
        const contestantsRef = collection(db, 'contestants');
        const snapshot = await getDocs(contestantsRef);
        
        let totalVotes = 0;
        snapshot.forEach(doc => {
            const contestant = doc.data();
            totalVotes += contestant.votes || 0;
        });
        
        // Calculate prize fund (90% of total votes at $0.50 each)
        const prizePool = totalVotes * 0.5 * 0.9 * 480; // Converting USD to NGN (approximate rate)
        
        // Update display
        if (prizeFundDisplay) {
            prizeFundDisplay.textContent = formatCurrency(prizePool);
        }
    } catch (error) {
        console.error('Error updating prize fund:', error);
    }
}

// Flutterwave Payment Integration
export function initFlutterwavePayment(customerInfo, amount, contestantId, voteCount, callback) {
    FlutterwaveCheckout({
        public_key: window.FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: `vote-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        amount: amount,
        currency: "NGN",
        payment_options: "card, banktransfer, ussd",
        customer: {
            email: customerInfo.email,
            name: customerInfo.name || "Smallie Voter"
        },
        customizations: {
            title: "Smallie Vote Payment",
            description: `${voteCount} vote(s) for ${customerInfo.contestantName}`,
            logo: window.location.origin + "/static/images/logo.png",
        },
        callback: function(response) {
            // Handle successful payment
            if (response.status === "successful") {
                processSuccessfulPayment(contestantId, voteCount, customerInfo.email, 'flutterwave', response.transaction_id)
                    .then(() => {
                        if (callback) callback(true);
                    })
                    .catch(error => {
                        console.error('Error processing payment:', error);
                        if (callback) callback(false);
                    });
            } else {
                // Payment failed or was cancelled
                if (callback) callback(false);
            }
        },
        onclose: function() {
            // This is called when the customer closes the payment modal
            console.log("Payment modal closed");
        }
    });
}

// Solana Phantom Wallet Integration
export async function initSolanaPayment(customerInfo, amount, contestantId, voteCount, callback) {
    try {
        // Check if Phantom wallet is installed
        const { solana } = window;
        
        if (!solana || !solana.isPhantom) {
            alert("Phantom wallet is not installed. Please install it from https://phantom.app/");
            return;
        }
        
        // Connect to Phantom wallet
        await solana.connect();
        
        // Prepare transaction (using devnet)
        const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'));
        
        // Simple SOL transfer transaction
        // In a real implementation, you'd use a proper payment processor for Solana
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: solana.publicKey,
                toPubkey: new solanaWeb3.PublicKey('insert-your-wallet-public-key-here'),
                lamports: solanaWeb3.LAMPORTS_PER_SOL * (amount / 1000) // Convert NGN to SOL (approximate)
            })
        );
        
        // Get recent blockhash
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = solana.publicKey;
        
        // Sign and send transaction
        const signedTransaction = await solana.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        
        // Wait for confirmation
        await connection.confirmTransaction(signature);
        
        // Process successful payment
        await processSuccessfulPayment(contestantId, voteCount, customerInfo.email, 'solana', signature);
        
        if (callback) callback(true);
        
    } catch (error) {
        console.error('Error processing Solana payment:', error);
        if (callback) callback(false);
    }
}

// Process successful payment and update votes
async function processSuccessfulPayment(contestantId, voteCount, email, paymentMethod, transactionId) {
    try {
        // Create payment record
        const paymentsRef = collection(db, 'payments');
        await addDoc(paymentsRef, {
            contestantId: contestantId,
            voteCount: voteCount,
            amount: voteCount * 0.5, // $0.50 per vote
            email: email,
            method: paymentMethod,
            transactionId: transactionId,
            timestamp: serverTimestamp(),
            status: 'completed'
        });
        
        // Create votes record
        const votesRef = collection(db, 'votes');
        await addDoc(votesRef, {
            contestantId: contestantId,
            count: voteCount,
            email: email,
            timestamp: serverTimestamp(),
            paymentMethod: paymentMethod,
            transactionId: transactionId
        });
        
        // Update contestant vote count
        const contestantRef = doc(db, 'contestants', contestantId);
        await updateDoc(contestantRef, {
            votes: increment(voteCount)
        });
        
        // Update the UI to reflect the new vote count
        const contestantCard = document.querySelector(`[data-contestant-id="${contestantId}"]`);
        if (contestantCard) {
            const votesBadge = contestantCard.querySelector('.votes-badge');
            if (votesBadge) {
                const currentVotes = parseInt(votesBadge.textContent) || 0;
                votesBadge.textContent = `${currentVotes + voteCount} votes`;
            }
        }
        
        // Update prize fund display
        updatePrizeFund();
        
        return true;
    } catch (error) {
        console.error('Error processing payment record:', error);
        throw error;
    }
}

// Initialize payment buttons
document.addEventListener('DOMContentLoaded', () => {
    // Update prize fund on page load
    updatePrizeFund();
    
    // Flutterwave payment
    if (flutterwavePayBtn) {
        flutterwavePayBtn.addEventListener('click', () => {
            // Get data from vote modal
            const contestantId = voteModal.dataset.contestantId;
            const voteCount = parseInt(voteModal.dataset.voteCount);
            const email = voteModal.dataset.email || 'guest@smallie.com';
            const contestantName = document.getElementById('modal-contestant-name').textContent;
            
            // Close vote modal
            voteModal.style.display = 'none';
            
            // Initialize Flutterwave payment
            initFlutterwavePayment(
                {
                    email: email,
                    contestantName: contestantName
                },
                voteCount * 0.5 * 480, // $0.50 per vote, converted to NGN (approximate)
                contestantId,
                voteCount,
                (success) => {
                    if (success) {
                        // Show success modal
                        document.getElementById('success-modal').style.display = 'flex';
                    } else {
                        alert('Payment was cancelled or failed. Please try again.');
                    }
                }
            );
        });
    }
    
    // Solana payment
    if (solanaPayBtn) {
        solanaPayBtn.addEventListener('click', () => {
            // Get data from vote modal
            const contestantId = voteModal.dataset.contestantId;
            const voteCount = parseInt(voteModal.dataset.voteCount);
            const email = voteModal.dataset.email || 'guest@smallie.com';
            const contestantName = document.getElementById('modal-contestant-name').textContent;
            
            // Close vote modal
            voteModal.style.display = 'none';
            
            // Initialize Solana payment
            initSolanaPayment(
                {
                    email: email,
                    contestantName: contestantName
                },
                voteCount * 0.5 * 480, // $0.50 per vote, converted to NGN (approximate)
                contestantId,
                voteCount,
                (success) => {
                    if (success) {
                        // Show success modal
                        document.getElementById('success-modal').style.display = 'flex';
                    } else {
                        alert('Solana payment was cancelled or failed. Please try again.');
                    }
                }
            );
        });
    }
});