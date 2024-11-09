const goButton = document.getElementById('submit');

goButton.addEventListener('click', function (event) {
    let username = document.getElementById('username-input').value;

    if (username) {
        window.location.href = `user.html?username=${username}`;
    } else {
        document.getElementById('input').innerHTML = `
            <input id="username-input" type="text" placeholder="ENTER A USERNAME">
            <span id="warning">Enter a valid username</span>
            <button id="submit">GO</button>
        `;
        
        document.getElementById('username-input').style.border = '1px solid #ff3813';
        document.getElementById('username-input').style.borderBottom = 'none';
        document.getElementById('username-input').style.borderRadius = '4px 4px 0 0';
        document.getElementById('warning').innerText = 'Enter a valid username';
    }
});