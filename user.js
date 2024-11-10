const gradeColours = {
    'z': '#7e7e7e',
    'd': '#907591',
    'd+': '#8e6091',
    'c-': '#79558c',
    'c': '#733e8f',
    'c+': '#552883',
    'b-': '#5650c7',
    'b': '#4f64c9',
    'b+': '#4f99c0',
    'a-': '#3bb687',
    'a': '#46ad51',
    'a+': '#1fa834',
    's-': '#b2972b',
    's': '#e0a71b',
    's+': '#d8af0e',
    'ss': '#db8b1f',
    'u': '#ff3813',
    'x': '#ff45ff',
    'x+': '#a763ea',
}

const corsProxy = 'https://corsproxy.io/?';

const params = new URLSearchParams(window.location.search);
const username = params.get('username').toLowerCase();

document.getElementById('title').innerText = username.toUpperCase();
document.getElementById('tc-link').href = `https://ch.tetr.io/u/${username}`;

// Wait for all fetch requests to complete before making the body visible
const sessionId = generateSessionID();
const fetchConfig = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        // 'X-Session-ID': sessionId,
        'mode': 'no-cors',
    }
};

const interval = setInterval(updateData, 30000);

updateData();

function updateData() {
    Promise.all([
        fetch(corsProxy + `https://ch.tetr.io/api/users/${username}`),
        fetch(corsProxy + `https://ch.tetr.io/api/labs/league_ranks`),
        fetch(corsProxy + `https://ch.tetr.io/api/users/${username}/summaries/league`)
    ])
        .then(responses => Promise.all(responses.map(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })))
        .then(([userData, leagueRanksData, userLeagueData]) => {
            console.log([userData, leagueRanksData, userLeagueData]);

            // WIN RATE
            const gamesWon = userData['data']['gameswon'];
            const gamesPlayed = userData['data']['gamesplayed'];
            const gamesLost = gamesPlayed - gamesWon;
            if (gamesPlayed === -1 || gamesWon === -1) {
                document.getElementById('win-rate-scale').innerHTML = '<p class="hide-warning">User has chosen to hide this statistic</p>';
                document.getElementById('win-rate-stats').innerHTML = '';
            } else if (gamesPlayed === 0) {
                document.getElementById('win-rate-scale').innerHTML = '<p class="hide-warning">User has not played any games yet</p>';
                document.getElementById('win-rate-stats').innerHTML = '';
            } else {
                document.getElementById('win-scale').innerText = numberWithSeperator(gamesWon);
                document.getElementById('win-scale').style.width = `${gamesWon / gamesPlayed * 100}%`;
                document.getElementById('loss-scale').innerText = numberWithSeperator(gamesLost);
                document.getElementById('loss-scale').style.width = `${gamesLost / gamesPlayed * 100}%`;
                document.getElementById('win-rate').innerText = numberWithSeperator(Math.round(gamesWon / gamesPlayed * 10000) / 100);
                document.getElementById('games-played').innerText = numberWithSeperator(gamesPlayed);
            }

            // EXPERIENCE
            const xpCount = userData['data']['xp'];
            document.getElementById('xp').innerText = numberWithSeperator(Math.round(xpCount));
            const level = calculateLevel(xpCount)
            document.getElementById('xp-level').innerText = level;
            if (level < 5000) {
                document.getElementById('xp-level').className = `level-tag badge-colour-${Math.floor(level / 500)} end-colour-${Math.floor(level % 100 / 10)} end-shape-${Math.floor((level / 100) % 5)}`;
            } else {
                document.getElementById('xp-level').className = `level-tag golden`;
            }

            // TETRA LEAGUE
            const tr = userLeagueData['data']['tr'];
            const rank = userLeagueData['data']['rank'];

            if (tr >= 0) {
                // graph
                const gradeData = leagueRanksData['data']['data'];
                let counter = 0;
                let previousTR = 25000;
                document.getElementById('rank-graph').innerHTML = '';
                for (let grade in gradeData) {
                    if (grade !== 'total') {
                        const currentTR = gradeData[grade]['tr'];

                        const gradeSection = document.createElement('div');
                        gradeSection.className = 'grade-box';
                        gradeSection.id = `grade-box-${grade}`;
                        gradeSection.style.backgroundColor = gradeColours[grade];
                        gradeSection.innerHTML = `<span>${grade.toUpperCase()}</span>`;
                        // gradeSection.style.width = `${(gradeData[grade]['count'] / gradeData['total']) * 100}%`;
                        gradeSection.style.width = `${((previousTR - currentTR) / 25000) * 100}%`;
                        if (counter === 0) { gradeSection.style.borderRadius = '0 4px 4px 0'; }
                        if (counter === Object.keys(gradeData).length - 1) { gradeSection.style.borderRadius = '4px 0 0 4px'; }

                        if (previousTR >= tr && tr > currentTR) {
                            console.log(`${grade} starts at ${currentTR}TR`);
                            console.log(`Your TR: ${tr}TR`);
                            console.log(`TR difference: ${tr - currentTR}TR`);
                            console.log(`Grade width: ${previousTR - currentTR}TR`);
                            console.log(`Pointer %: ${(tr - currentTR) / (previousTR - currentTR) * 100}%`);

                            gradeSection.innerHTML += '<img id="tr-pointer" src="pointer.png"></img>';
                            document.getElementById('rank-graph').appendChild(gradeSection);
                            document.getElementById('tr-pointer').style.left = `${(tr - currentTR) / (previousTR - currentTR) * 100}%`;
                        } else {
                            document.getElementById('rank-graph').appendChild(gradeSection);
                        }

                        counter++;


                        previousTR = gradeData[grade]['tr'];
                    }
                }

                // user data
                const gamesWon = userLeagueData['data']['gameswon'];
                const gamesPlayed = userLeagueData['data']['gamesplayed'];
                const gamesLost = gamesPlayed - gamesWon;

                document.getElementById('tl-win-scale').innerText = numberWithSeperator(gamesWon);
                document.getElementById('tl-win-scale').style.width = `${gamesWon / gamesPlayed * 100}%`;
                document.getElementById('tl-loss-scale').innerText = numberWithSeperator(gamesLost);
                document.getElementById('tl-loss-scale').style.width = `${gamesLost / gamesPlayed * 100}%`;
                document.getElementById('tl-win-rate').innerText = numberWithSeperator(Math.round(gamesWon / gamesPlayed * 10000) / 100);
                document.getElementById('tl-games-played').innerText = numberWithSeperator(gamesPlayed);

                document.getElementById('grade').innerText = rank === 'z' ? '?' : rank.toUpperCase();
                document.getElementById('grade').style.color = gradeColours[rank];
                document.getElementById('tr').innerText = numberWithSeperator(Math.round(tr * 100) / 100);

                if (rank !== 'z') {
                    // highlight the user's grade box
                    document.getElementById(`grade-box-${rank}`).style.height = '65px';
                    document.getElementById(`grade-box-${rank}`).style.paddingTop = '2px';
                    document.getElementById(`grade-box-${rank}`).style.position = 'relative';
                    document.getElementById(`grade-box-${rank}`).style.bottom = '5px';
                    document.getElementById(`grade-box-${rank}`).style.paddingBottom = '3px';
                    document.getElementById(`grade-box-${rank}`).style.borderRadius = '4px';
                } else {
                    document.getElementById('tr-pointer').src = 'pointer-short.png';
                    document.getElementById('tr-pointer').style.transform = 'translate(-50%, -50%)';
                }
            } else {
                document.getElementById('tl-win-scale').innerText = 0;
                document.getElementById('tl-win-scale').style.width = '50%';
                document.getElementById('tl-loss-scale').innerText = 0;
                document.getElementById('tl-loss-scale').style.width = '50%';

                document.getElementById('tl-win-rate').innerText = '?';
                document.getElementById('tl-games-played').innerText = 0;

                document.getElementById('grade').innerText = rank === 'z' ? '?' : rank.toUpperCase();
                document.getElementById('grade').style.color = gradeColours[rank];
                document.getElementById('tr').innerText = '?';
            }

            // RANKINGS
            if (rank === 'z') {
                document.getElementById('tl-leaderboard').innerHTML = 'No TETRA LEAGUE ranking';
                document.getElementById('tl-leaderboard').className += ' hide-warning';
            } else {
                let userTLPlacement = userLeagueData['data']['standing'];
                console.log(userTLPlacement);
                const isFirst = userLeagueData['data']['standing'] === 1;
                if (isFirst) {
                    userTLPlacement++;
                }

                if (userTLPlacement > 0) {   
                    fetch(corsProxy + `https://ch.tetr.io/api/users/by/league?limit=${Math.min(userTLPlacement - 1, 2)}&before=${tr}:0:0`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json(); // Parse the JSON from the response
                    })
                    .then(better => {
                        userTLPlacement--;

                        console.log('better', better); // Use the data from the response
                            
                        const betterEntries = better['data']['entries'];

                        let priSecTer;
                        if (!isFirst) {   
                            priSecTer = betterEntries[betterEntries.length - 1]['p'];
                        } else {
                            priSecTer = { 'pri': tr, 'sec': 0, 'ter': 0 };
                        }

                        const pri = priSecTer['pri'];
                        const sec = priSecTer['sec'];
                        const ter = priSecTer['ter'];
                        
                        fetch(corsProxy + `https://ch.tetr.io/api/users/by/league?limit=${Math.max(5 - userTLPlacement, 3)}&after=${pri}:${sec}:${ter}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json(); // Parse the JSON from the response
                        })
                            .then(worse => {
                                console.log('worse', worse); // Use the data from the response
                                
                                const worseEntries = worse['data']['entries'];
                                
                                let leaderboard;
                                if (isFirst) {
                                    const playerEntry = {
                                        'username': username,
                                        'league': {
                                            'glicko': userLeagueData['data']['glicko'],
                                            'rd': userLeagueData['data']['rd'],
                                            'tr': tr,
                                            'rank': rank,
                                        }
                                    };

                                    console.log(playerEntry);
                                    leaderboard = [playerEntry].concat(worseEntries);
                                } else {
                                    leaderboard = betterEntries.concat(worseEntries);
                                }
                                console.log(leaderboard);
                                
                                document.getElementById('tl-leaderboard').innerHTML = `
                                <h3 class="leaderboard-heading">TETRA LEAGUE</h2>
                                    <div class="leaderboard-entry leaderboard-title">
                                    <span class="placement"></span>
                                        <span class="name"></span>
                                        <span class="glicko">GLICKO</span>
                                        <span class="tr">TR</span>
                                        <span class="rank">RANK</span>
                                        </div>
                                        `;
                                        
                                        let placementOffset = -Math.min(userTLPlacement - 1, 2);
                                        leaderboard.forEach(entry => {
                                            const entryElement = document.createElement('div');
                                            entryElement.className = 'leaderboard-entry' + (entry['username'] === username ? ' leaderboard-you' : '');
                                            entryElement.innerHTML = `
                                            <span class="placement">#${userTLPlacement + placementOffset}</span>
                                            <span class="name">${entry['username'].toUpperCase()}</span>
                                            <span class="glicko">${numberWithSeperator(entry['league']['glicko'])}±${numberWithSeperator(Math.round(entry['league']['rd']))}</span>
                            <span class="tr">${numberWithSeperator(entry['league']['tr'])}</span>
                            <span class="rank" style="color: ${gradeColours[entry['league']['rank']]};">${entry['league']['rank'] === 'z' ? '?' : entry['league']['rank'].toUpperCase()}</span>
                            `;
                            
                            document.getElementById('tl-leaderboard').appendChild(entryElement);
                            
                                    placementOffset++;
                                });
                            })
                            .catch(error => {
                                console.error('There was a problem with the fetch operation:', error);
                            });
                    })
                    .catch(error => {
                        console.error('There was a problem with the fetch operation:', error);
                    });
                }
            }
            
            // FINISH
            // make body visible
            document.body.style.visibility = 'visible';
        })
        .catch(error => {
            console.error('There was a problem with the fetch operations:', error);
        });
}


function calculateLevel(xp) {
    return Math.floor((xp / 500) ** 0.6 + (xp / (5000 + Math.max(0, xp - 4000000) / 5000) + 1))
}

function numberWithSeperator(x) {
    // return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return x.toLocaleString(undefined, {
        // minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

function generateSessionID() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}