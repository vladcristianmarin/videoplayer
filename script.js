// DIRECTORUL MEDIA NU CONTINE VIDEOCLIPURILE DEOARCE DEPASEAU LIMITA DE 10 MB
// PENTRU A TESTA CODUL VA LAS UN LINK DE UNDE PUTETI DESCARCA ARHIVA CU VIDEOCLIPURILE FOLOSITE DE MINE
//link: https://drive.google.com/file/d/1bIIf1d0mJh4dKg5-LfmNCuGAkEQHJV2L/view?usp=sharing

const DEFAULT_VIDEOS = [
	{
		title: "Bee Gees - Stayin' Alive",
		url: './media/stayinalive.webm',
	},
	{
		title: 'Michael Jackson - Billie Jean',
		url: './media/billiejean.webm',
	},
	{
		title: 'Sting - Englishman in New York',
		url: './media/englishinnewyork.webm',
	},
	{
		title: 'Billie Eilish - bad guy',
		url: './media/badguy.webm',
	},
];

const subtitles = [];

const loadSubtitles = async () => {
	const response = await fetch('./media/subtitles.json');
	const data = await response.json();

	subtitles.push(...data);
};

//Incarcarea iconitelro care urmeaza sa fie desenate pe canvas
const loadIcons = () => {
	player.playIcon.src = './media/play-outline.svg';
	player.pauseIcon.src = './media/pause-outline.svg';
	player.prevIcon.src = './media/play-skip-back-outline.svg';
	player.nextIcon.src = './media/play-skip-forward-outline.svg';
	player.unmuteIcon.src = './media/volume-mute.svg';
	player.muteIcon.src = './media/volume-high-outline.svg';
	player.volumeIcon.src = './media/volume-off.svg';
};

//Aceasta functie creaza un list item,
// care face parte din playlist si este apelata pentru cate videoclipuri exista in playlist-ul curent
const createPlaylistItem = () => {
	const li = document.createElement('li');
	li.classList.add('video-player--playlist__item');
	const div1 = document.createElement('div');
	const div2 = document.createElement('div');
	li.appendChild(div1);
	li.appendChild(div2);
	const loadingImg = document.createElement('img');
	loadingImg.src = './media/loading.png';
	loadingImg.alt = 'video thumbnail';
	const title = document.createElement('span');
	title.classList.add('title');
	div1.appendChild(loadingImg);
	div1.appendChild(title);
	const time = document.createElement('span');
	time.classList.add('time');
	const btnUp = document.createElement('button');
	const btnRemove = document.createElement('button');
	btnUp.classList.add('up');
	btnRemove.classList.add('remove');
	const iconUp = document.createElement('ion-icon');
	iconUp.setAttribute('name', 'arrow-up-outline');
	const iconRemove = document.createElement('ion-icon');
	iconRemove.setAttribute('name', 'close-outline');
	btnUp.appendChild(iconUp);
	btnRemove.appendChild(iconRemove);
	div2.appendChild(time);
	div2.appendChild(btnUp);
	div2.appendChild(btnRemove);

	btnUp.addEventListener('click', function (e) {
		e.stopPropagation();
		const title =
			this.parentElement.previousElementSibling.children[1].innerHTML;
		const index = player.videos
			.map((e) => {
				return e.title;
			})
			.indexOf(title);
		if (index > 0) {
			[player.videos[index], player.videos[index - 1]] = [
				player.videos[index - 1],
				player.videos[index],
			];
			player.loadPlaylist();
			player.playlist.children[index - 1].classList.add('selected');
		}
	});

	btnRemove.addEventListener('click', function (e) {
		e.stopPropagation();
		const title =
			this.parentElement.previousElementSibling.children[1].innerHTML;
		const index = player.videos
			.map((e) => {
				return e.title;
			})
			.indexOf(title);
		player.videos.splice(index, 1);
		player.loadPlaylist();
		player.playlist.children[index].classList.add('selected');
		player.play(player.videos[index].url);
	});

	return li;
};

//acesta este obiectul de care o sa ma folosesc pentru a crea aplicatia
const player = {
	videoElement: null,
	preview: null,
	canvas: null,
	ctx: null,
	videos: [...DEFAULT_VIDEOS],
	playlist: null,
	hasPreview: false,
	X: 0,
	Y: 0,
	selectedEffect: 'default',
	requestAnimationFrameId: 0,
	playIcon: new Image(),
	pauseIcon: new Image(),
	prevIcon: new Image(),
	nextIcon: new Image(),
	unmuteIcon: new Image(),
	muteIcon: new Image(),
	volumeIcon: new Image(),
	hasSettings: false,
};

//functia load incarca datele de care are nevoie player-ul pentru prima data cand pagina web este incarcata
player.load = () => {
	player.videoElement = document.createElement('video');
	player.preview = document.createElement('video');
	player.canvas = document.querySelector('.video-player--content canvas');
	player.ctx = player.canvas.getContext('2d');
	player.videoElement.src = player.videos[0].url;
	player.playlist = document.querySelector('.video-player--playlist');

	player.preview.height = Math.round(player.canvas.height / 5);
	player.preview.width = Math.round(player.canvas.width / 5);
	loadIcons();
	loadSubtitles();
	if (localStorage.getItem('wasSongPlayed') === 'true')
		player.hasSettings = true;
};

//functiile de draw, deseneaza relativ in functie de width si height, acestea au fost
// hardcodate initial, iar dupa am calculat procentual
player.drawPlayPause = () => {
	const w = player.canvas.width;
	const h = player.canvas.height;
	if (player.videoElement.paused) {
		return player.ctx.drawImage(player.playIcon, 0.03 * w, 0.9 * h);
	}
	player.ctx.drawImage(player.pauseIcon, 0.03 * w, 0.9 * h);
};

player.drawPrev = () => {
	const w = player.canvas.width;
	const h = player.canvas.height;
	player.ctx.drawImage(player.prevIcon, 0.09 * w, 0.9 * h);
};

player.drawNext = () => {
	const w = player.canvas.width;
	const h = player.canvas.height;
	player.ctx.drawImage(player.nextIcon, 0.13 * w, 0.9 * h);
};

player.drawMute = () => {
	const w = player.canvas.width;
	const h = player.canvas.height;

	player.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
	player.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
	if (player.videoElement.muted) {
		return player.ctx.drawImage(player.unmuteIcon, 0.17 * w, 0.9 * h);
	}

	player.ctx.drawImage(player.muteIcon, 0.17 * w, 0.9 * h);
};

player.drawProgressBar = () => {
	const w = player.canvas.width;
	const h = player.canvas.height;
	player.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
	player.ctx.lineWidth = 9;
	player.ctx.beginPath();
	player.ctx.rect(w / 4, 0.9 * h + 10, w / 2, 50);
	player.ctx.stroke();
};

player.fillProgressBar = () => {
	const w = player.canvas.width;
	const h = player.canvas.height;
	const progressBarSpan = w / 2;
	const offset =
		(player.videoElement.currentTime * progressBarSpan) /
		player.videoElement.duration;
	player.ctx.fillStyle = 'rgba(192, 57, 43, 0.7)';
	player.ctx.beginPath();
	player.ctx.fillRect(w / 4 + 4.5, 0.9 * h + 14.5, offset, 41);
	player.ctx.fill();
};

player.drawTime = () => {
	const w = player.canvas.width;
	const h = player.canvas.height;
	player.ctx.font = 'bold 48px Roboto';
	player.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
	player.ctx.fillText(
		secondsToString(player.videoElement.currentTime),
		0.76 * w,
		0.9 * h + 48
	);
};

player.drawVolume = () => {
	const w = player.canvas.width;
	const h = player.canvas.height;
	player.ctx.drawImage(player.volumeIcon, 0.87 * w, 0.9 * h - 5);
};

player.drawVolumeBar = () => {
	const w = player.canvas.width;
	const h = player.canvas.height;
	player.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
	player.ctx.lineWidth = 4;
	player.ctx.beginPath();
	player.ctx.rect(0.905 * w, 0.9 * h - 95, 20, 150);
	player.ctx.stroke();
	player.ctx.fillStyle = 'rgba(192, 57, 43, 0.7)';
	player.ctx.fillRect(0.905 * w + 2, 0.9 * h - 93, 16, 146);
};

player.fillVolumeBar = () => {
	const w = player.canvas.width;
	const h = player.canvas.height;
	const offset = 146 - 146 * player.videoElement.volume;
	player.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
	player.ctx.beginPath();
	player.ctx.fillRect(0.905 * w + 2, 0.9 * h - 93, 16, offset);
};

const drawText = (index) => {
	const w = player.canvas.width;
	const h = player.canvas.height;
	player.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
	player.ctx.font = 'bold 48px Roboto';
	const offset = player.ctx.measureText(subtitles[index].text).width / 2;

	player.ctx.fillText(subtitles[index].text, w / 2 - offset, 0.85 * h);
};

player.drawSubtitles = () => {
	const quarters = [];
	const quarter = player.videoElement.duration / 4;
	for (let i = 0; i < 4; i++) {
		quarters[i] = quarter * i;
	}

	if (player.videoElement.currentTime >= quarters[3]) {
		return drawText(3);
	}
	if (player.videoElement.currentTime >= quarters[2]) {
		return drawText(2);
	}
	if (player.videoElement.currentTime >= quarters[1]) {
		return drawText(1);
	}
	return drawText(0);
};

const grayscale = () => {
	const imageData = player.ctx.getImageData(
		0,
		0,
		player.canvas.width,
		player.canvas.height
	);
	const pixels = imageData.data;
	for (let i = 0; i < pixels.length; i += 4) {
		const color =
			0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
		pixels[i] = pixels[i + 1] = pixels[i + 2] = color;
	}

	player.ctx.putImageData(imageData, 0, 0);
};

const contrast = () => {
	const imageData = player.ctx.getImageData(
		0,
		0,
		player.canvas.width,
		player.canvas.height
	);
	const pixels = imageData.data;

	let colorSum = 0;
	for (let i = 0; i < pixels.length; i += 4) {
		const r = pixels[i];
		const g = pixels[i + 1];
		const b = pixels[i + 2];
		const avg = Math.floor((r + g + b) / 3);
		colorSum += avg;
	}
	const brightness = Math.floor(
		colorSum / (player.canvas.width * player.canvas.height)
	);
	const beta = 85;
	const alpha = (255 + beta) / (255 - beta);

	for (let i = 0; i < pixels.length; i += 4) {
		pixels[i] = Math.floor(alpha * (pixels[i] - brightness) * brightness);
		pixels[i + 1] = Math.floor(
			alpha * (pixels[i + 1] - brightness) * brightness
		);
		pixels[i + 2] = Math.floor(
			alpha * (pixels[i + 2] - brightness) * brightness
		);
	}

	player.ctx.putImageData(imageData, 0, 0);
};

const warmer = () => {
	const imageData = player.ctx.getImageData(
		0,
		0,
		player.canvas.width,
		player.canvas.height
	);
	const pixels = imageData.data;
	for (let i = 0; i < pixels.length; i += 4) {
		pixels[i] = pixels[i] + 10;
		pixels[i + 1] = pixels[i + 1] + 18;
	}
	player.ctx.putImageData(imageData, 0, 0);
};

const grime = () => {
	const imageData = player.ctx.getImageData(
		0,
		0,
		player.canvas.width,
		player.canvas.height
	);
	const pixels = imageData.data;
	for (let i = 0; i < pixels.length; i += 4) {
		pixels[i + 1] = pixels[i] + 5;
		pixels[i] = pixels[i] + 1;
	}

	player.ctx.putImageData(imageData, 0, 0);
};

const roseTint = () => {
	const imageData = player.ctx.getImageData(
		0,
		0,
		player.canvas.width,
		player.canvas.height
	);
	const pixels = imageData.data;
	for (i = 0; i < pixels.length; i += 4) {
		let avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
		pixels[i] = avg + 80;
		pixels[i + 1] = avg + 20;
		pixels[i + 2] = avg + 31;
	}

	player.ctx.putImageData(imageData, 0, 0);
};

player.drawPreview = () => {
	player.ctx.drawImage(
		player.preview,
		player.X * 2,
		player.Y * 2,
		player.preview.width,
		player.preview.height
	);
};

//functia de draw video, deseneaza videoclipul, filtrele daca este cazul si toate controalele
player.drawVideo = () => {
	const w = player.canvas.width;
	const h = player.canvas.height;
	player.ctx.drawImage(player.videoElement, 0, 0, w, h);
	switch (player.selectedEffect) {
		case 'grayscale':
			grayscale();
			break;
		case 'warmer':
			warmer();
			break;
		case 'grime':
			grime();
			break;
		case 'roseTint':
			roseTint();
			break;
		case 'contrast':
			contrast();
			break;
		default:
			break;
	}
	player.drawPlayPause();
	player.drawNext();
	player.drawPrev();
	player.drawMute();
	player.drawVolume();
	player.drawProgressBar();
	player.fillProgressBar();
	player.drawTime();
	player.drawVolumeBar();
	player.fillVolumeBar();
	player.drawSubtitles();
	player.hasPreview && player.drawPreview();
	player.requestAnimationFrameId = requestAnimationFrame(player.drawVideo);
};

player.play = (url) => {
	player.videoElement.setAttribute('src', url);
	player.videoElement.play();
};

//in functia next ma folosesc de location protocol pentru a afla exact url cu care trebuie sa compar url-ul salvat in vectorul meu de obiecte
player.next = () => {
	const currentVideo = player.videos
		.filter((item) => {
			return (
				window.location.protocol +
					'//' +
					window.location.host +
					item.url.slice(1) ===
				player.videoElement.src
			);
		})
		.shift();
	const currentIndex = player.videos.indexOf(currentVideo);
	let nextIndex = currentIndex + 1;

	nextIndex >= player.videos.length && (nextIndex = 0);

	for (item of player.playlist.children) {
		if (
			item.children[0].children[1].innerHTML === player.videos[nextIndex].title
		) {
			item.classList.add('selected');
		}
		if (
			item.children[0].children[1].innerHTML ===
			player.videos[currentIndex].title
		) {
			item.classList.remove('selected');
		}
	}

	player.play(player.videos[nextIndex].url);
};

player.prev = () => {
	const currentVideo = player.videos
		.filter((item) => {
			return (
				window.location.protocol +
					'//' +
					window.location.host +
					item.url.slice(1) ===
				player.videoElement.src
			);
		})
		.shift();
	const currentIndex = player.videos.indexOf(currentVideo);
	let prevIndex = currentIndex - 1;

	prevIndex < 0 && (prevIndex = player.videos.length - 1);

	for (item of player.playlist.children) {
		if (
			item.children[0].children[1].innerHTML === player.videos[prevIndex].title
		) {
			item.classList.add('selected');
		}
		if (
			item.children[0].children[1].innerHTML ===
			player.videos[currentIndex].title
		) {
			item.classList.remove('selected');
		}
	}

	player.play(player.videos[prevIndex].url);
};

//aceasta functie genereaza cate un list item pentru fiecare video din player.videos
//iar apoi pentru fiecare videoclip creaza un thumbnail pe baza imaginii de la secunda 10 (valoare aleasa random)

player.loadPlaylist = () => {
	const thumbnails = [];
	player.playlist.innerHTML = '';

	let i = 0;
	player.videos.forEach((video) => {
		player.playlist.appendChild(createPlaylistItem());
		thumbnails.push({
			virtualVideo: document.createElement('video'),
			canvas: document.createElement('canvas'),
			ctx: null,
			index: i,
		});
		thumbnails[i].virtualVideo.src = video.url;
		thumbnails[i].virtualVideo.muted = true;
		thumbnails[i].virtualVideo.autoplay = true;
		thumbnails[i].canvas.width = thumbnails[i].virtualVideo.width = 1920;
		thumbnails[i].canvas.height = thumbnails[i].virtualVideo.height = 1080;
		thumbnails[i].ctx = thumbnails[i].canvas.getContext('2d');
		i++;
	});

	const playlistItems = document.querySelectorAll(
		'.video-player--playlist__item'
	);
	const times = document.querySelectorAll('.time');

	const videosList = document.querySelectorAll('.video-player--playlist__item');

	videosList.forEach((item) => {
		item.addEventListener('click', function (e) {
			videosList.forEach((item) => item.classList.remove('selected'));
			this.classList.add('selected');
			const video = player.videos.filter((item) => {
				return item.title === this.children[0].children[1].innerHTML;
			});
			const selectedVideo = video.shift();
			player.play(selectedVideo.url);
		});
	});

	i = 0;
	thumbnails.forEach((thumbnail) => {
		thumbnail.virtualVideo.addEventListener('seeked', function () {
			thumbnail.ctx.drawImage(
				this,
				0,
				0,
				thumbnail.canvas.width,
				thumbnail.canvas.height
			);
			playlistItems[thumbnail.index].children[0].children[0].src =
				thumbnail.canvas.toDataURL();
		});
		thumbnail.virtualVideo.addEventListener('loadedmetadata', function () {
			times[thumbnail.index].innerHTML = secondsToString(this.duration);
		});
	});

	thumbnails.forEach((thumbnail) => {
		thumbnail.virtualVideo.currentTime = 15;
	});

	i = 0;
	player.videos.forEach((video) => {
		playlistItems[i].children[0].children[1].innerHTML = video.title;
		i++;
	});
};

//aceasta functie este folosita pentru pune videoclipul pe pauza si pe play, dar si pentru a
//aplica setarile din localstorage o singura data daca ele exista

const playPause = () => {
	if (player.hasSettings) {
		const videoTitle = document.querySelector('.player-header--title');
		const video = player.videos
			.filter(
				(video) =>
					video.url.split('/')[2] ===
					localStorage.getItem('video').split('/')[4]
			)
			.shift();
		videoTitle.innerHTML = video.title;
		player.videoElement.setAttribute('src', video.url);
		player.videoElement.volume = localStorage.getItem('volume');
		player.videoElement.play();
		player.videoElement.currentTime = localStorage.getItem('time');
		for (child of player.playlist.children) {
			child.classList.remove('selected');
			if (child.children[0].children[1].innerHTML === video.title) {
				child.classList.add('selected');
			}
		}
		return;
	}

	if (player.videoElement.paused) {
		player.videoElement.play();
		return;
	}

	player.videoElement.pause();
};

const playPauseButton = document.querySelector('.playPause');

playPauseButton.addEventListener('click', playPause);

const dots = document.querySelector('.dot-pulse');

const nextBtn = document.querySelector('.nextVideo');
nextBtn.addEventListener('click', player.next);

const prevBtn = document.querySelector('.prevVideo');
prevBtn.addEventListener('click', player.prev);

const uploadBtn = document.querySelector('.uploadVideo');
const fileInput = document.querySelector('#fileBrowser');

//aici declansez fileInput-ul de fiecare data cand se apasa pe un buton
uploadBtn.addEventListener('click', (e) => {
	e.preventDefault();
	fileInput.click();
});

fileInput.addEventListener('change', (e) => {
	e.preventDefault();
	const file = e.target.files[0];
	const fileObj = URL.createObjectURL(file);
	player.videoElement.setAttribute('src', fileObj);
	const name = file.name.split('.')[0];
	const video = {
		title: name,
		url: player.videoElement.src,
	};
	player.videos.push(video);
	player.loadPlaylist();
});

//acest cod este folosit doar pentru stilurile css
const filtersList = document.querySelectorAll('.video-player--filters li');
const indicator = document.querySelector('.indicator');

filtersList.forEach((item) =>
	item.addEventListener('click', function (e) {
		e.stopPropagation();
		filtersList.forEach((item) => item.classList.remove('active'));
		this.classList.add('active');
		indicator.style.opacity = '1';
	})
);
const container = document.querySelector('.video-player--filters');
container.addEventListener('click', (e) => {
	filtersList.forEach((item) => item.classList.remove('active'));
	indicator.style.opacity = '0';
	player.selectedEffect = 'default';
});

filtersList[0].addEventListener('click', () => {
	player.selectedEffect = 'grayscale';
});

filtersList[1].addEventListener('click', () => {
	player.selectedEffect = 'contrast';
});

filtersList[2].addEventListener('click', () => {
	player.selectedEffect = 'warmer';
});

filtersList[3].addEventListener('click', () => {
	player.selectedEffect = 'grime';
});

filtersList[4].addEventListener('click', () => {
	player.selectedEffect = 'roseTint';
});

window.onload = () => {
	player.load();
	player.loadPlaylist();

	player.videoElement.addEventListener('pause', (e) => {
		//acest setTimeout asigura ca buton-ul de pause din canvas are timp sa se schimbe in cel de play inainte sa fie oprita desenarea
		setTimeout(() => cancelAnimationFrame(player.requestAnimationFrameId), 50);
		playPauseButton.children[0].setAttribute('name', 'play-outline');
		dots.style.opacity = '0';
	});

	player.videoElement.addEventListener('play', (e) => {
		player.hasSettings = false;
		player.drawVideo();

		const videoTitle = document.querySelector('.player-header--title');
		if (
			videoTitle.innerHTML === 'NOTHING IS PLAYING' &&
			!document.querySelector('.selected')
		) {
			player.playlist.children[0].classList.add('selected');
		}
		playPauseButton.children[0].setAttribute('name', 'pause-outline');
		dots.style.opacity = '1';
		const title =
			document.querySelector('.selected').children[0].children[1].innerHTML;
		videoTitle.innerHTML = title;
	});

	player.videoElement.addEventListener('ended', player.next);

	player.videoElement.addEventListener('timeupdate', () => {
		player.fillProgressBar(
			player.videoElement.duration,
			player.videoElement.currentTime
		);
	});

	player.videoElement.addEventListener('loadeddata', () => {
		player.preview.src = player.videoElement.src;
	});

	// aici calculez ce control este apasat in functie de pozitia cursorului pe canvas
	// si pentru fiecare control in parte aplic comportamentul necesar

	player.canvas.addEventListener('click', (e) => {
		const container = document.querySelector('.video-player--content');
		player.X = e.offsetX;
		player.Y = e.offsetY;
		const w = container.offsetWidth;
		const h = container.offsetHeight;
		if (
			player.X >= 0.03 * w &&
			player.X <= 0.03 * w + 20 &&
			player.Y >= 0.9 * h &&
			player.Y <= 0.9 * h + 20
		) {
			return playPause();
		}

		if (
			player.X >= 0.17 * w &&
			player.X <= 0.17 * w + 30 &&
			player.Y >= 0.9 * h &&
			player.Y <= 0.9 * h + 20
		) {
			return (player.videoElement.muted = !player.videoElement.muted);
		}

		if (
			player.X >= 0.09 * w &&
			player.X <= 0.09 * w + 30 &&
			player.Y >= 0.9 * h &&
			player.Y <= 0.9 * h + 20
		) {
			return player.prev();
		}

		if (
			player.X >= 0.13 * w &&
			player.X <= 0.13 * w + 30 &&
			player.Y >= 0.9 * h &&
			player.Y <= 0.9 * h + 20
		) {
			return player.next();
		}

		if (
			player.X >= w / 4 + 4.5 &&
			player.X <= (3 / 4) * w &&
			player.Y >= 0.9145 * h &&
			player.Y <= 0.9145 * h + 15
		) {
			const barSpan = (3 / 4) * w - (w / 4 + 4.5);
			const positionOnBar = player.X - 0.255 * w;
			const percentOfBar = (positionOnBar / barSpan).toFixed(4);

			const totalDuration = player.videoElement.duration;
			player.videoElement.currentTime = percentOfBar * totalDuration;
		}

		if (
			player.X >= 0.905 * w &&
			player.X <= 0.905 * w + 10 &&
			player.Y >= 0.95 * h - 60 &&
			player.Y <= 0.95 * h + 5
		) {
			let percentOfVolume = ((0.95 * h - player.Y) / 55).toFixed(1);
			percentOfVolume > 1 && (percentOfVolume = 1);
			percentOfVolume < 0 && (percentOfVolume = 0);
			player.videoElement.volume = percentOfVolume;
		}
	});

	//aici este implementat preview-ul pe progressbar
	player.canvas.addEventListener('mousemove', (e) => {
		const container = document.querySelector('.video-player--content');
		player.X = e.offsetX;
		player.Y = e.offsetY;
		const w = container.offsetWidth;
		const h = container.offsetHeight;

		if (
			player.X >= w / 4 + 4.5 &&
			player.X <= (3 / 4) * w &&
			player.Y >= 0.9145 * h &&
			player.Y <= 0.9145 * h + 15
		) {
			const barSpan = (3 / 4) * w - (w / 4 + 4.5);
			const positionOnBar = player.X - 0.255 * w;
			const percentOfBar = (positionOnBar / barSpan).toFixed(4);

			const totalDuration = player.videoElement.duration;
			player.preview.currentTime = percentOfBar * totalDuration;
			return (player.hasPreview = true);
		}
		player.hasPreview && (player.hasPreview = false);
	});

	player.canvas.addEventListener('mouseleave', () => {
		player.hasPreview && (player.hasPreview = false);
	});
};

//aici salvez in localStorage setarile, doar daca acestea sunt pe un videoclip
// din cele 4 default

window.onbeforeunload = () => {
	localStorage.clear();
	const videoTitle = document.querySelector('.player-header--title');
	if (
		DEFAULT_VIDEOS.some(
			(video) =>
				window.location.protocol +
					'//' +
					window.location.host +
					video.url.slice(1) ===
				player.videoElement.src
		)
	) {
		localStorage.setItem('video', player.videoElement.src);
		localStorage.setItem('time', player.videoElement.currentTime);
		localStorage.setItem('volume', player.videoElement.volume);
		localStorage.setItem(
			'wasSongPlayed',
			videoTitle.innerHTML !== 'NOTHING IS PLAYING'
		);
	}
};

//COD PRELUAT DE PE GITHUB

/**
 * A utility function for converting a time in miliseconds to a readable time of minutes and seconds.
 * @param {number} seconds The time in seconds.
 * @return {string} The time in minutes and/or seconds.
 **/
const secondsToString = (seconds) => {
	let min = Math.floor(seconds / 60);
	let sec = Math.floor(seconds % 60);

	min = min >= 10 ? min : '0' + min;
	sec = sec >= 10 ? sec : '0' + sec;

	const time = min + ':' + sec;

	return time;
};
