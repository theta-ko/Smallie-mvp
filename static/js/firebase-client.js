/**
 * Firebase Client Integration for Smallie
 * Handles authentication and voting functionality
 */

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { 
    getAuth,
    signInWithRedirect,
    GoogleAuthProvider,
    getRedirectResult,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import {
    getFirestore,
    collection,
    doc,
    addDoc,
    updateDoc,
    getDoc,
    increment,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

// Initialize Firebase with values from server
const firebaseConfig = {
    apiKey: window.FIREBASE_API_KEY,
    authDomain: `${window.FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: window.FIREBASE_PROJECT_ID,
    storageBucket: `${window.FIREBASE_PROJECT_ID}.appspot.com`,
    appId: window.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// DOM Elements
const loginButton = document.getElementById('login-button');
const userProfile = document.getElementById('user-profile');
const userName = document.getElementById('user-name');
const userAvatar = document.getElementById('user-avatar');
const logoutButton = document.getElementById('logout-button');
const voteForm = document.getElementById('voting-form');
const voteCountElement = document.getElementById('vote-count');
const votePriceElement = document.getElementById('vote-price');
const modalVoteCount = document.getElementById('modal-vote-count');
const modalContestantName = document.getElementById('modal-contestant-name');
const modalVoteTotal = document.getElementById('modal-vote-total');
const confirmVoteButton = document.getElementById('confirm-vote');
const voteModal = document.getElementById('vote-modal');
const successModal = document.getElementById('success-modal');

// Authentication state listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        if (loginButton) loginButton.style.display = 'none';
        if (userProfile) {
            userProfile.style.display = 'flex';
            userName.textContent = user.displayName || 'User';
            userAvatar.src = user.photoURL || '/static/images/default-avatar.png';
        }
    } else {
        // User is signed out
        if (loginButton) loginButton.style.display = 'block';
        if (userProfile) userProfile.style.display = 'none';
    }
});

// Handle redirect result on page load
window.addEventListener('DOMContentLoaded', () => {
    getRedirectResult(auth)
        .then((result) => {
            if (result && result.user) {
                console.log('User signed in after redirect:', result.user.displayName);
            }
        })
        .catch((error) => {
            console.error('Authentication error:', error.message);
        });
});

// Add event listeners
if (loginButton) {
    loginButton.addEventListener('click', () => {
        signInWithRedirect(auth, provider);
    });
}

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        auth.signOut().then(() => {
            console.log('User signed out');
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    });
}

// Get contestant details
async function getContestantDetails(contestantId) {
    try {
        const contestantDoc = await getDoc(doc(db, 'contestants', contestantId.toString()));
        if (contestantDoc.exists()) {
            return contestantDoc.data();
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting contestant:', error);
        return null;
    }
}

// Set up direct vote buttons on contestant cards
const contestantVoteButtons = document.querySelectorAll('.contestant-card .btn-vote');
if (contestantVoteButtons.length > 0) {
    contestantVoteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Get contestant ID from button
            const contestantId = button.dataset.id;
            const card = button.closest('.contestant-card');
            
            // Don't allow voting on eliminated contestants
            if (card.classList.contains('eliminated')) {
                alert('This contestant has been eliminated and can no longer receive votes.');
                return;
            }
            
            // Get contestant name from card
            const contestantName = card.querySelector('h3').textContent;
            
            // Pre-select this contestant in the main voting form if it exists
            const selectElement = document.getElementById('contestant-select');
            if (selectElement) {
                for (let i = 0; i < selectElement.options.length; i++) {
                    if (selectElement.options[i].value === contestantId) {
                        selectElement.selectedIndex = i;
                        break;
                    }
                }
            }
            
            // Default to 1 vote
            const voteCount = 1;
            
            // Update modal content
            modalContestantName.textContent = contestantName;
            modalVoteCount.textContent = voteCount;
            modalVoteTotal.textContent = (voteCount * 0.5).toFixed(2);
            
            // Show confirmation modal
            voteModal.style.display = 'flex';
            
            // Store data for confirmation
            voteModal.dataset.contestantId = contestantId;
            voteModal.dataset.voteCount = voteCount;
            voteModal.dataset.email = ''; // Will prompt for email later if needed
        });
    });
}

// Vote submission from the main form
if (voteForm) {
    const selectElement = document.getElementById('contestant-select');
    const voteCountInput = document.getElementById('vote-count');
    const emailInput = document.getElementById('email');
    const decreaseButton = document.getElementById('decrease-votes');
    const increaseButton = document.getElementById('increase-votes');
    
    // Update vote count and price
    function updateVotePrice() {
        const count = parseInt(voteCountInput.value) || 1;
        const price = (count * 0.5).toFixed(2);
        votePriceElement.textContent = price;
    }
    
    // Export the function for use in other modules
    window.updateVotePrice = updateVotePrice;
    
    // Set up vote counter buttons
    if (decreaseButton) {
        decreaseButton.addEventListener('click', () => {
            const currentVal = parseInt(voteCountInput.value) || 1;
            if (currentVal > 1) {
                voteCountInput.value = currentVal - 1;
                updateVotePrice();
            }
        });
    }
    
    if (increaseButton) {
        increaseButton.addEventListener('click', () => {
            const currentVal = parseInt(voteCountInput.value) || 1;
            voteCountInput.value = currentVal + 1;
            updateVotePrice();
        });
    }
    
    if (voteCountInput) {
        voteCountInput.addEventListener('change', updateVotePrice);
    }
    
    // Vote form submission
    voteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const contestantId = selectElement.value;
        const voteCount = parseInt(voteCountInput.value) || 1;
        const email = emailInput.value;
        
        // Get contestant name for the confirmation modal
        const contestantOption = selectElement.options[selectElement.selectedIndex];
        const contestantName = contestantOption.text;
        
        // Update modal content
        modalContestantName.textContent = contestantName;
        modalVoteCount.textContent = voteCount;
        modalVoteTotal.textContent = (voteCount * 0.5).toFixed(2);
        
        // Show confirmation modal
        voteModal.style.display = 'flex';
        
        // Store data for confirmation
        voteModal.dataset.contestantId = contestantId;
        voteModal.dataset.voteCount = voteCount;
        voteModal.dataset.email = email;
    });
}

// Confirm vote button
if (confirmVoteButton) {
    confirmVoteButton.addEventListener('click', async () => {
        const contestantId = voteModal.dataset.contestantId;
        const voteCount = parseInt(voteModal.dataset.voteCount);
        const email = voteModal.dataset.email;
        
        try {
            // Get current day
            const currentDay = parseInt(document.querySelector('#daily-task h2').textContent.split(' ')[1]) || 1;
            
            // Create a vote record
            const voteData = {
                contestantId: contestantId,
                count: voteCount,
                email: email,
                timestamp: serverTimestamp(),
                day: currentDay
            };
            
            // Add the vote to Firebase
            const votesRef = collection(db, 'votes');
            await addDoc(votesRef, voteData);
            
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
            
            // Close vote modal
            voteModal.style.display = 'none';
            
            // Show success modal
            successModal.style.display = 'flex';
            
            // Reset form
            voteForm.reset();
            updateVotePrice();
            
        } catch (error) {
            console.error('Error submitting vote:', error);
            alert('There was an error submitting your vote. Please try again.');
            voteModal.style.display = 'none';
        }
    });
}

// Close modal buttons
document.querySelectorAll('.close, #cancel-vote').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateVotePrice();
});