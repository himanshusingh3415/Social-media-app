


let users = [{ username: 'demo', profilePhoto: '', friends: [], messages: [], photos: [] }];
let currentUser = users[0];


function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
}
function loadData() {
    const data = localStorage.getItem('users');
    if (data) users = JSON.parse(data);
}


if (document.body.classList.contains('main-page')) {
    loadData();
    currentUser = users[0];
    
    const friendRequests = document.getElementById('friendRequests');
    friendRequests.innerHTML = users.filter(u => u.username !== currentUser.username && !currentUser.friends.includes(u.username))
        .map(u => `<div>${u.username} <button onclick="addFriend('${u.username}')">Add Friend</button></div>`).join('');

    window.addFriend = function(friendName) {
        if (!currentUser.friends.includes(friendName)) {
            currentUser.friends.push(friendName);
            saveData();
            location.reload();
        }
    };

    
    const messageBox = document.getElementById('messageBox');
    messageBox.innerHTML = currentUser.friends.map(friend => {
        return `<div><b>${friend}</b><form onsubmit="sendMessage(event, '${friend}')">
            <input type='text' id='msg_${friend}' placeholder='Type a message...'>
            <button type='submit'>Send</button></form>
            <div id='msgs_${friend}'>${(currentUser.messages.filter(m => m.to === friend || m.from === friend).map(m => `<div class='comment'><b>${m.from}:</b> ${m.text}</div>`).join(''))}</div></div>`;
    }).join('');

    window.sendMessage = function(e, friend) {
        e.preventDefault();
        const msgInput = document.getElementById('msg_' + friend);
        const text = msgInput.value;
        if (text) {
            currentUser.messages.push({ from: currentUser.username, to: friend, text });
            saveData();
            msgInput.value = '';
            location.reload();
        }
    };

    
    const photoFeed = document.getElementById('photoFeed');
    let allPhotos = users.flatMap(u => u.photos.map(p => ({ ...p, owner: u.username })));
    photoFeed.innerHTML = allPhotos.reverse().map((p, idx) => `
        <div class='photo-card'>
            <b>${p.owner}</b><br>
            <img src='${p.url}' alt='Photo'><br>
            <button class='like-btn' onclick="likePhoto(${idx})">❤ ${p.likes || 0}</button>
            <div class='comment-section'>
                ${(p.comments||[]).map(c => `<div class='comment'><b>${c.user}:</b> ${c.text}</div>`).join('')}
                <form onsubmit="addComment(event, ${idx})">
                    <input type='text' id='comment_${idx}' placeholder='Add a comment...'>
                    <button type='submit'>Comment</button>
                </form>
            </div>
        </div>
    `).join('');

    window.likePhoto = function(idx) {
        let photo = allPhotos[allPhotos.length-1-idx];
        photo.likes = (photo.likes || 0) + 1;
        saveData();
        location.reload();
    };

    window.addComment = function(e, idx) {
        e.preventDefault();
        let photo = allPhotos[allPhotos.length-1-idx];
        if (!photo.comments) photo.comments = [];
        const commentInput = document.getElementById('comment_' + idx);
        if (commentInput.value) {
            photo.comments.push({ user: currentUser.username, text: commentInput.value });
            saveData();
            location.reload();
        }
    };


    document.getElementById('uploadForm').onsubmit = function(e) {
        e.preventDefault();
        const file = document.getElementById('photoInput').files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                currentUser.photos.push({ url: evt.target.result, likes: 0, comments: [] });
                saveData();
                location.reload();
            };
            reader.readAsDataURL(file);
        }
    };
}


if (document.body.classList.contains('profile-page')) {
    loadData();
    currentUser = users[0];
    
    const preview = document.getElementById('profilePhotoPreview');
    if (currentUser.profilePhoto) {
        preview.src = currentUser.profilePhoto;
        preview.style.display = 'block';
    }
    document.getElementById('editUsername').value = currentUser.username;

    document.getElementById('profilePhotoInput').onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                preview.src = evt.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    };

    document.getElementById('profileForm').onsubmit = function(e) {
        e.preventDefault();
        const newUsername = document.getElementById('editUsername').value;
        if (newUsername && newUsername !== currentUser.username) {
        
            users.forEach(u => {
                u.friends = u.friends.map(f => f === currentUser.username ? newUsername : f);
                u.messages.forEach(m => {
                    if (m.from === currentUser.username) m.from = newUsername;
                    if (m.to === currentUser.username) m.to = newUsername;
                });
            });
            currentUser.username = newUsername;
        }
        if (preview.src) currentUser.profilePhoto = preview.src;
        saveData();
        alert('Profile updated!');
        location.reload();
    };
}
