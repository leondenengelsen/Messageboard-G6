// Import necessary functions from Firebase SDK
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, get, update, remove, onValue } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBkhDaFysGKdVS5xq5MQUMy0sgFImUbz_o",
    authDomain: "messageboard-g6.firebaseapp.com",
    databaseURL: "https://messageboard-g6-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "messageboard-g6",
    storageBucket: "messageboard-g6.appspot.com",
    messagingSenderId: "189203259901",
    appId: "1:189203259901:web:dafe90dd08ad6150d87994"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Function to add a message
export async function addMessageToFirebase(message, user, color) {
    const messageData = {
        message,
        user,
        like: 0,
        dislike: 0,
        color,
        banned: false,
    };

    const messagesRef = ref(db, "messages");
    const newMessageRef = await push(messagesRef, messageData);
    return { id: newMessageRef.key, ...messageData };
}

// Function to fetch messages
export async function fetchMessagesFromFirebase() {
    const messagesRef = ref(db, "messages");
    const snapshot = await get(messagesRef);

    if (!snapshot.exists()) {
        return [];
    }

    const data = snapshot.val();
    return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
}

// Function to update likes/dislikes
export async function updateLikeDislikeFirebase(messageId, type) {
    const messageRef = ref(db, `messages/${messageId}`);
    const snapshot = await get(messageRef);

    if (!snapshot.exists()) {
        throw new Error("Message not found");
    }

    const messageData = snapshot.val();
    const updatedData = {
        like: type === "like" ? (messageData.like || 0) + 1 : messageData.like,
        dislike: type === "dislike" ? (messageData.dislike || 0) + 1 : messageData.dislike,
    };

    await update(messageRef, updatedData);
}

// Function to update banned status
export async function patchBanned(id, banned) {
    console.log("Patching user:", id, "Banned:", banned);

    const messageRef = ref(db, `messages/${id}`);
    await update(messageRef, { banned });

    console.log("Successfully updated banned status");
    return { id, banned };
}

// Function to delete a message
export async function deleteMessageFromFirebase(messageId) {
    try {
        const messageRef = ref(db, `messages/${messageId}`);
        await remove(messageRef);
        console.log("Message deleted successfully");
    } catch (error) {
        console.error("Error deleting message:", error);
    }
}

// Function to listen for real-time changes
export function listenForMessageChanges(callback) {
    const messagesRef = ref(db, "messages");

    // Attach the listener
    onValue(messagesRef, (snapshot) => {
        if (!snapshot.exists()) {
            callback([]);
            return;
        }

        const data = snapshot.val();
        const messages = Object.keys(data).map((key) => ({ id: key, ...data[key] }));

        // Call the provided callback with the updated messages
        callback(messages);
    });
}
