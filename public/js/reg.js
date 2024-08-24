const firebaseConfig = {
    apiKey: "AIzaSyDm9Qpv3uGByOVix841pKBCXIJhhblbwKQ",
    authDomain: "bsu-mabini-comlab.firebaseapp.com",
    databaseURL: "https://bsu-mabini-comlab-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bsu-mabini-comlab",
    storageBucket: "bsu-mabini-comlab.appspot.com",
    messagingSenderId: "548993981418",
    appId: "1:548993981418:web:b1f35c7b026c253c27b093"
};

firebase.initializeApp(firebaseConfig);

// Reference to Firebase authentication and database
const auth = firebase.auth();
const database = firebase.database();

// Get a reference to the register form and the submit button
const registerForm = document.getElementById('registerForm');
const submitButton = document.getElementById('submitButton');

// Handle form submission
registerForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission

    // Disable the submit button to prevent multiple submissions
    submitButton.disabled = true;

    // Get user input
    const email = registerForm['email'].value;
    const password = registerForm['password'].value;
    const srcode = registerForm['srcode'].value; // Assuming srcode is a string here
    const firstName = registerForm['firstName'].value;
    const lastName = registerForm['lastName'].value;
    const middleInitial = registerForm['middleInitial'].value;

    // Check if all fields are filled
    if (!email || !password || !srcode || !firstName || !lastName) {
        alert('Please fill out all fields.');
        submitButton.disabled = false; // Re-enable the submit button
        return;
    }

    // Validate email domain
    const emailDomain = email.split('@')[1];
    console.log('Email domain:', emailDomain); // Log the email domain for debugging
    if (emailDomain !== 'g.batstate-u.edu.ph') {
        alert('Please use your @g.batstate-u.edu.ph email address.');
        submitButton.disabled = false; // Re-enable the submit button
        return;
    }

    // Check if srcode already exists in the database
    database.ref('users/' + srcode).once('value')
        .then((srcodeSnapshot) => {
            if (srcodeSnapshot.exists()) {
                // srcode already exists
                alert('srcode already exists.');
                submitButton.disabled = false; // Re-enable the submit button
            } else {
                // Check if email already exists in the database
                database.ref('users').orderByChild('email').equalTo(email).once('value')
                    .then((emailSnapshot) => {
                        if (emailSnapshot.exists()) {
                            // Email already exists
                            alert('Email already exists.');
                            submitButton.disabled = false; // Re-enable the submit button
                        } else {
                            // Register the user with Firebase authentication
                            auth.createUserWithEmailAndPassword(email, password)
                                .then((userCredential) => {
                                    // User registered successfully
                                    const user = userCredential.user;

                                    // Save additional user data to Firebase database
                                    database.ref('users/' + srcode).set({
                                        email: email,
                                        srcode: srcode,
                                        firstName: firstName,
                                        lastName: lastName,
                                        middleInitial: middleInitial
                                    })
                                    .then(() => {
                                        // Data saved successfully
                                        alert('Registration successful!');
                                        // Clear the form after successful registration
                                        registerForm.reset();
                                        submitButton.disabled = false; // Re-enable the submit button
                                    })
                                    .catch((error) => {
                                        console.error('Error saving user data:', error.message);
                                        alert('Registration failed. Please try again.');
                                        submitButton.disabled = false; // Re-enable the submit button
                                    });
                                })
                                .catch((error) => {
                                    console.error('Error registering user:', error.message);
                                    alert('Registration failed. Please try again.');
                                    submitButton.disabled = false; // Re-enable the submit button
                                });
                        }
                    })
                    .catch((error) => {
                        console.error('Error checking email existence:', error.message);
                        alert('Registration failed. Please try again.');
                        submitButton.disabled = false; // Re-enable the submit button
                    });
            }
        })
        .catch((error) => {
            console.error('Error checking srcode existence:', error.message);
            alert('Registration failed. Please try again.');
            submitButton.disabled = false; // Re-enable the submit button
        });
});
