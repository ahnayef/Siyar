# Important: Firestore Index Required

If you're seeing an error when viewing public timelines, you need to create a composite index in Firebase.

## Steps to Create the Index:

1. Go to the Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Navigate to Firestore Database > Indexes
4. Click "Add Index"
5. Enter the following information:
   - Collection ID: `timelines`
   - Fields to index:
     - `username` (Ascending)
     - `isPublic` (Ascending)
     - `createdAt` (Descending)
   - Query scope: `Collection`
6. Click "Create Index"

Alternatively, you can click on the link in the error message which will take you directly to the page to create the necessary index.

After creating the index, it may take a few minutes to build. Once it's complete, the public timelines will load correctly.
