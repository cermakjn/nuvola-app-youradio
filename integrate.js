/*
 * Copyright 2015 Jan Čermák <nuvola@jan-cermak.cz>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

(function(Nuvola)
{

    var player = Nuvola.$object(Nuvola.MediaPlayer);

    // Create new WebApp prototype
    var WebApp = Nuvola.$WebApp();

    // Handy aliases
    var PlaybackState = Nuvola.PlaybackState;
    var PlayerAction = Nuvola.PlayerAction;

    /**
     * Initialization routines
     * @param emitter
     * @private
     */
    WebApp._onInitWebWorker = function(emitter)
    {
        Nuvola.WebApp._onInitWebWorker.call(this, emitter);

        var state = document.readyState;
        if(state === 'interactive' || state === 'complete')
            this._onPageReady();
        else
            document.addEventListener('DOMContentLoaded', this._onPageReady.bind(this));
    };

    /**
     * @private
     */
    WebApp._onPageReady = function()
    {
        window.stopButton = document.getElementsByClassName('yr2-navbar-stop')[0];
        window.playButton = document.getElementsByClassName('yr2-navbar-play')[0];
        window.pauseButton = document.getElementsByClassName('yr2-navbar-pause')[0];
        window.skipButton = document.getElementsByClassName('yr2-navbar-skip')[0];

        // Connect handler for signal ActionActivated
        Nuvola.actions.connect("ActionActivated", this);

        this.update();
    };

    /**
     * Update
     */
    WebApp.update = function()
    {
        // Playback State
        var state = PlaybackState.UNKNOWN;
        if(window.stopButton.style.display === 'none' || window.pauseButton.classList.contains('active'))
            state = PlaybackState.PAUSED;
        else
            state = PlaybackState.PLAYING;

        // Track
        var track = {
            'title': document.getElementsByClassName('yr2-navbar-player-metadata-info-song')[0].innerText,
            'artist': document.getElementsByClassName('yr2-navbar-player-metadata-info-artist')[0].innerText,
            'album': null,
            'artLocation': document.getElementsByClassName('yr2-navbar-cover')[0].src
        };

        // Is pause available?
        window.pauseAvailable = (state === PlaybackState.PLAYING && window.pauseButton.style.display !== 'none');
        // Is pause active?
        window.pauseActive = (state === PlaybackState.PAUSED && window.pauseButton.style.display !== 'none' && window.pauseButton.classList.contains('active'));


        player.setTrack(track);
        player.setPlaybackState(state);
        player.setCanGoPrev(false); // YR does not support it
        player.setCanPlay(state === PlaybackState.PAUSED);
        player.setCanPause(state === PlaybackState.PLAYING);
        player.setCanGoNext(true);

        // Schedule the next update
        setTimeout(this.update.bind(this), 500);
    };

    /**
     * Action handler.
     * @param emitter
     * @param name
     * @param param
     * @private
     */
    WebApp._onActionActivated = function(emitter, name, param)
    {
        switch (name) {
            case PlayerAction.TOGGLE_PLAY:
                if (window.pauseAvailable || window.pauseActive) // Playing && pause button is active OR is paused
                    Nuvola.clickOnElement(window.pauseButton);
                else if (player._state === PlaybackState.PLAYING) // Playing && pause button is not active
                    Nuvola.clickOnElement(window.stopButton);
                else // Paused
                    Nuvola.clickOnElement(window.playButton);

                break;
            case PlayerAction.PLAY:
                if(window.pauseActive) // Paused
                    Nuvola.clickOnElement(window.pauseButton);
                else
                    Nuvola.clickOnElement(window.playButton);
                break;
            case PlayerAction.PAUSE:
                if(window.pauseAvailable)
                    Nuvola.clickOnElement(window.pauseButton);
                else
                    Nuvola.clickOnElement(window.stopButton);
                break;
            case PlayerAction.NEXT_SONG:
                Nuvola.clickOnElement(window.skipButton);
                break;
            case PlayerAction.STOP:
                Nuvola.clickOnElement(window.stopButton);
                break;
        }
    };

    WebApp.start();

})(this);  // function(Nuvola)
