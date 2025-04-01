/**
 * Smallie Timer - Countdown to 9 PM WAT voting closure
 * This script manages the countdown timer and progress bar for the daily task
 */

// DOM Elements
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const progressBar = document.getElementById('voting-progress');

// Function to update the countdown to 9 PM WAT (West Africa Time)
function updateVotingCountdown() {
    // Get current date and time
    const now = new Date();
    
    // Create target date (today at 9 PM WAT)
    // WAT is UTC+1
    const target = new Date();
    target.setUTCHours(20, 0, 0, 0); // 9 PM WAT = 8 PM UTC
    
    // If it's already past 9 PM WAT, set target to next day
    if (now > target) {
        target.setDate(target.getDate() + 1);
    }
    
    // Calculate time difference in milliseconds
    const timeDiff = target - now;
    
    // Calculate hours, minutes, seconds
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    // Update DOM elements
    hoursElement.textContent = String(hours).padStart(2, '0');
    minutesElement.textContent = String(minutes).padStart(2, '0');
    secondsElement.textContent = String(seconds).padStart(2, '0');
    
    // Update progress bar
    updateProgressBar(now, target);
}

// Function to update progress bar
function updateProgressBar(now, target) {
    // If it's past 9 PM, we're showing progress toward the next day
    // We define new task time at 9 AM WAT
    const newTaskTime = new Date();
    newTaskTime.setUTCHours(8, 0, 0, 0); // 9 AM WAT = 8 AM UTC
    
    // If it's already past 9 AM, new task time is today at 9 AM
    // If before 9 AM, new task time was yesterday at 9 AM
    if (now.getUTCHours() < 8) {
        newTaskTime.setDate(newTaskTime.getDate() - 1);
    }
    
    // Calculate total duration between new task announcement and voting closure
    const totalDuration = target - newTaskTime;
    
    // Calculate elapsed time since new task announcement
    const elapsedTime = now - newTaskTime;
    
    // Calculate progress percentage (capped at 100%)
    let progressPercent = (elapsedTime / totalDuration) * 100;
    progressPercent = Math.min(Math.max(progressPercent, 0), 100);
    
    // Update progress bar width
    progressBar.style.width = `${progressPercent}%`;
}

// Initialize and start timer
updateVotingCountdown();
setInterval(updateVotingCountdown, 1000);