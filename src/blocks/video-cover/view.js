document.addEventListener('DOMContentLoaded', function() {
    const videoCovers = document.querySelectorAll('.wp-block-wpzoom-video-cover');
    if (!videoCovers.length) return;
    
    // Load APIs only if needed
    const hasVimeo = Array.from(videoCovers).some(cover => 
        cover.querySelector('iframe[src*="vimeo.com"]')
    );
    const hasYouTube = Array.from(videoCovers).some(cover => 
        cover.querySelector('iframe[src*="youtube.com"]')
    );

    // Load Vimeo API if needed
    if (hasVimeo) {
        const vimeoScript = document.createElement('script');
        vimeoScript.src = "https://player.vimeo.com/api/player.js";
        vimeoScript.onload = initVimeoVideos;
        document.body.appendChild(vimeoScript);
    }

    // Load YouTube API if needed
    if (hasYouTube) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = initYouTubeVideos;
    }

    // Initialize local videos immediately
    initLocalVideos();

    function initVimeoVideos() {
        videoCovers.forEach(cover => {
            const iframe = cover.querySelector('iframe[src*="vimeo.com"]');
            const pauseButton = cover.querySelector('.wpzoom-video-cover__pause-button');
            const unmuteButton = cover.querySelector('.wpzoom-video-cover__unmute-button');
            
            if (!iframe) return;
            
            const player = new Vimeo.Player(iframe);
            
            if (pauseButton) {
                pauseButton.classList.add('is-playing');
                
                pauseButton.addEventListener('click', function() {
                    player.getPaused().then(function(paused) {
                        if (paused) {
                            player.play();
                            pauseButton.classList.add('is-playing');
                            pauseButton.classList.remove('is-paused');
                        } else {
                            player.pause();
                            pauseButton.classList.remove('is-playing');
                            pauseButton.classList.add('is-paused');
                        }
                    });
                });
            }

            if (unmuteButton) {
                unmuteButton.classList.add('is-muted');
                
                unmuteButton.addEventListener('click', function() {
                    player.getVolume().then(function(volume) {
                        if (volume === 0) {
                            player.setVolume(1);
                            unmuteButton.classList.add('is-unmuted');
                            unmuteButton.classList.remove('is-muted');
                        } else {
                            player.setVolume(0);
                            unmuteButton.classList.remove('is-unmuted');
                            unmuteButton.classList.add('is-muted');
                        }
                    });
                });
            }
        });
    }

    function initYouTubeVideos() {
        videoCovers.forEach(cover => {
            const iframe = cover.querySelector('iframe[src*="youtube.com"]');
            const pauseButton = cover.querySelector('.wpzoom-video-cover__pause-button');
            const unmuteButton = cover.querySelector('.wpzoom-video-cover__unmute-button');
            
            if (!iframe) return;
            
            const player = new YT.Player(iframe, {
                events: {
                    'onReady': function(event) {
                        if (pauseButton) {
                            pauseButton.classList.add('is-playing');
                            
                            pauseButton.addEventListener('click', function() {
                                const state = player.getPlayerState();
                                if (state === YT.PlayerState.PLAYING) {
                                    player.pauseVideo();
                                    pauseButton.classList.remove('is-playing');
                                    pauseButton.classList.add('is-paused');
                                } else {
                                    player.playVideo();
                                    pauseButton.classList.add('is-playing');
                                    pauseButton.classList.remove('is-paused');
                                }
                            });
                        }

                        if (unmuteButton) {
                            unmuteButton.classList.add('is-muted');
                            
                            unmuteButton.addEventListener('click', function() {
                                if (player.isMuted()) {
                                    player.unMute();
                                    unmuteButton.classList.add('is-unmuted');
                                    unmuteButton.classList.remove('is-muted');
                                } else {
                                    player.mute();
                                    unmuteButton.classList.remove('is-unmuted');
                                    unmuteButton.classList.add('is-muted');
                                }
                            });
                        }
                    }
                }
            });
        });
    }

    function initLocalVideos() {
        videoCovers.forEach(cover => {
            const video = cover.querySelector('video');
            const pauseButton = cover.querySelector('.wpzoom-video-cover__pause-button');
            const unmuteButton = cover.querySelector('.wpzoom-video-cover__unmute-button');
            const fullscreenButton = cover.querySelector('.wpzoom-video-cover__fullscreen-button');

            if (!video) return;

            if (pauseButton) {
                pauseButton.addEventListener('click', function() {
                    if (video.paused) {
                        video.play();
                        pauseButton.classList.add('is-playing');
                        pauseButton.classList.remove('is-paused');
                    } else {
                        video.pause();
                        pauseButton.classList.remove('is-playing');
                        pauseButton.classList.add('is-paused');
                    }
                });
                pauseButton.classList.add('is-playing');
            }

            if (unmuteButton) {
                unmuteButton.addEventListener('click', function() {
                    if (video.muted) {
                        video.muted = false;
                        unmuteButton.classList.add('is-unmuted');
                        unmuteButton.classList.remove('is-muted');
                    } else {
                        video.muted = true;
                        unmuteButton.classList.remove('is-unmuted');
                        unmuteButton.classList.add('is-muted');
                    }
                });
                unmuteButton.classList.add('is-muted');
            }

            if (fullscreenButton) {
                fullscreenButton.addEventListener('click', function() {
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                        fullscreenButton.classList.remove('is-fullscreen');
                    } else {
                        video.requestFullscreen();
                        fullscreenButton.classList.add('is-fullscreen');
                    }
                });

                document.addEventListener('fullscreenchange', function() {
                    if (!document.fullscreenElement) {
                        fullscreenButton.classList.remove('is-fullscreen');
                    }
                });
            }
        });
    }
}); 