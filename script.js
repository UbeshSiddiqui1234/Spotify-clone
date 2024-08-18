let songs;
let audio = new Audio();
let currfolder = "songs/songs1";
let cardCont ;

async function getSongs(currfolder) {
    //currfolder = folder
    
    let x = await fetch(`/${currfolder}/`);
    let response = await x.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");

    let songs = []
    for (let i = 0; i < anchors.length; i++) {
        if (anchors[i].href.endsWith(".mp3") || anchors[i].href.endsWith(".m4a")) {
            songs.push(anchors[i].href.split(`/${currfolder}/`)[1]);
        }
    }

    return songs;
}

function playSong(track, pause = false) {

    audio.src = (`/${currfolder}/` + track);

    if (!pause) {
        audio.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
}

function convertSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }


    const minutes = parseInt(Math.floor(seconds / 60));
    const remainingSeconds = parseInt(seconds % 60);


    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');


    return `${formattedMinutes}:${formattedSeconds}`;
}

async function displayAlbums() {
    let x = await fetch(`/songs/`);
    let response = await x.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");


    let folders = [];
    Array.from(anchors).forEach(e => {
        if (e.href.includes("/songs/")) {
            folders.push(e.href.split("/songs/")[1]);
        }
    })


    for (let i = 0; i < folders.length; i++) {
        let temp = document.getElementsByClassName("main")[0].innerHTML;

        let info = await fetch(`/songs/${folders[i]}/info.json`);
        info = await info.json();


        temp += `<h1>${info.description}</h1>
            <div id="cardContainer" class="cardContainer"></div>`
        document.getElementsByClassName("main")[0].innerHTML = temp;

        let cool = await fetch(`/songs/${folders[i]}/`);
        let coolR = await cool.text();
        let cooldiv = document.createElement("div");
        cooldiv.innerHTML = coolR;
        let coolsSongs = cooldiv.getElementsByTagName("a");
        let image;

        for (let j = 0; j < coolsSongs.length; j++) {
            if (coolsSongs[j].href.endsWith(".jpeg")) {
                image = coolsSongs[j].href
            }
        }

        for (let j = 0; j < coolsSongs.length; j++) {
            if (coolsSongs[j].href.endsWith(".mp3") || coolsSongs[j].href.endsWith(".m4a")) {
                temp = document.getElementsByClassName("cardContainer")[i].innerHTML;
                temp += `
            <div class="card">
                <img src="${image}" alt="">
                <div class="play-btn">
                    <img src="play-button-svgrepo-com.svg" alt="">
                </div>
                <h7>${coolsSongs[j].href.split(`${folders[i]}/`)[1].replaceAll("%20", " ")}</h7>
                <p class="grey">chill beats, lofi vibes ,chill tracks every week..</p>
            </div>`

                document.getElementsByClassName("cardContainer")[i].innerHTML = temp;
            }
        }

    }

    cardCont = document.getElementsByClassName("cardContainer")[0];

    Array.from(document.getElementsByClassName("card")).forEach( (e) => {
        e.addEventListener("click",async () => {
            document.getElementsByClassName("sub-box")[0].classList.add("invisible")
            document.getElementsByClassName("sub-box")[1].classList.add("invisible")
            let num = 1;
            for (let i = 0; i < document.getElementsByClassName("cardContainer").length; i++) {
                if (e.parentNode === document.getElementsByClassName("cardContainer")[i]) {
                    break;
                }
                num++;
            }
            cardCont = e.parentNode;
            currfolder = `songs/songs${num}`;
            playSong(e.getElementsByTagName("h7")[0].innerHTML.trim());

            let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
            songUL.innerHTML = ""
            songs = await getSongs(currfolder);

            for (const song of songs) {
                songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>WoW</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="play-btn2.svg" alt="">
                            </div> </li>`;
            }

            Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
                e.addEventListener("click", element => {
                    playSong(e.querySelector(".info").firstElementChild.innerHTML.trim())

                })
            })
        })
    })
}


async function main() {
    songs = await getSongs("songs/songs1");

    await displayAlbums();

    playSong(songs[0], true);




    play.addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            play.src = "pause.svg";
        }
        else {
            audio.pause();
            play.src = "play-btn2.svg";
        }
    })

    audio.addEventListener("timeupdate", () => {
        document.querySelector(".sDuration").innerHTML = `${convertSecondsToMinutes(audio.currentTime)}/${convertSecondsToMinutes(audio.duration)}`
        document.querySelector(".circle").style.left = (audio.currentTime / audio.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percentage = (e.offsetX / e.target.getBoundingClientRect().width);
        document.querySelector(".circle").style.left = percentage * 100 + "%";
        audio.currentTime = (audio.duration) * percentage;
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = -1 + "%";
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = -110 + "%";
    })

    previous.addEventListener("click", () => {
        let index = songs.indexOf(audio.src.split(`/${currfolder}/`)[1]);
        if (index == 0) playSong(songs[songs.length - 1])
        else playSong(songs[index - 1]);
    })
    next.addEventListener("click", () => {
        let index = songs.indexOf(audio.src.split(`/${currfolder}/`)[1]);
        if (index == songs.length - 1) playSong(songs[0])
        else playSong(songs[index + 1]);
    })

    document.getElementsByTagName("input")[0].addEventListener("change", (e) => {
        audio.volume = parseInt(e.target.value) / 100;
    })
    let check = false;
    setInterval(async () => {

        let index = songs.indexOf(audio.src.split(`/${currfolder}/`)[1]);
        let image = cardCont.getElementsByClassName("card")[index].getElementsByTagName("img")[0]


        let p = cardCont.getElementsByClassName("card")[index].getElementsByTagName("h7")[0]
        document.querySelector(".new").innerHTML =
            `<div><img src="${image.src}"></div>
                                                <p>${p.innerHTML}</p>`

        if (check) {
            document.querySelector(".new").classList.remove("invisible")
            document.querySelector(".right").style.overflowY = "clip"
        }
        else {
            document.querySelector(".new").classList.add("invisible")
            document.querySelector(".right").style.overflowY = "scroll"
        }
    },100)
    size.addEventListener("click", () => {
        check ^= 1;
        document.querySelector(".new").style.transition = "all 1s ease-out"

    })
    let bool = true;
    up.addEventListener("click", () => {
        if (bool) {
            document.querySelector(".playbar").style.bottom = "65vh"
            bool = false
            up.src = "down.svg"
        }
        else {
            document.querySelector(".playbar").style.bottom = "5vh"
            bool = true;
            up.src = "up.svg"
        }
    })

    let volCheck = true;
    let temp;
    vol.addEventListener("click",()=>{
        
        if(!volCheck){
            vol.src = "volume.svg"
            volCheck = true;
            audio.volume = temp;
            document.getElementsByTagName("input")[0].value = temp*100;
        }
        else{
            temp = audio.volume;
            vol.src = "mute.svg"
            audio.volume =0;
            volCheck = false
            document.getElementsByTagName("input")[0].value = 0;
        }
        
    })
}
 main();