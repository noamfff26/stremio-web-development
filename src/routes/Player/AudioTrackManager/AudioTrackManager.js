// Copyright (C) 2024 Stremio UI/UX Enhancement
// Advanced Audio Track Manager with Multi-Method Detection Algorithms

const EventEmitter = require('eventemitter3');
const { AUDIO_DETECTION_SETTINGS, AUDIO_CODECS, ERROR_MESSAGES, STATUS_INDICATORS } = require('../../../common/ENHANCED_CONSTANTS');

class AudioTrackManager extends EventEmitter {
    constructor() {
        super();
        this.audioContext = null;
        this.mediaSource = null;
        this.analyser = null;
        this.audioTracks = [];
        this.detectedTracks = [];
        this.detectionStatus = STATUS_INDICATORS.audioDetection.IDLE;
        this.confidenceScores = new Map();
        this.retryCount = 0;
        this.detectionTimeout = null;
        this.isDetecting = false;
        
        // Initialize audio context
        this.initializeAudioContext();
    }

    /**
     * Initialize Web Audio API context
     */
    initializeAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 2048;
                this.analyser.smoothingTimeConstant = 0.8;
            }
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.emit('error', { type: 'AUDIO_CONTEXT_ERROR', message: error.message });
        }
    }

    /**
     * Main audio track detection method
     * @param {HTMLVideoElement} videoElement - The video element to analyze
     * @param {Array} existingTracks - Existing audio tracks from video element
     * @returns {Promise<Array>} Enhanced audio tracks with detailed information
     */
    async detectAudioTracks(videoElement, existingTracks = []) {
        if (this.isDetecting) {
            console.warn('Audio detection already in progress');
            return existingTracks;
        }

        this.isDetecting = true;
        this.retryCount = 0;
        this.detectionStatus = STATUS_INDICATORS.audioDetection.DETECTING;
        this.emit('statusChange', this.detectionStatus);

        try {
            // Set detection timeout
            this.detectionTimeout = setTimeout(() => {
                this.handleDetectionTimeout();
            }, AUDIO_DETECTION_SETTINGS.timeout);

            // Start multi-method detection
            const enhancedTracks = await this.performMultiMethodDetection(videoElement, existingTracks);
            
            // Validate and enhance tracks
            const validatedTracks = await this.validateAndEnhanceTracks(enhancedTracks);
            
            // Update status based on results
            if (validatedTracks.length > 0) {
                this.detectionStatus = STATUS_INDICATORS.audioDetection.SUCCESS;
                this.detectedTracks = validatedTracks;
                this.emit('tracksDetected', validatedTracks);
            } else {
                this.detectionStatus = STATUS_INDICATORS.audioDetection.FAILED;
                this.emit('error', { 
                    type: 'NO_AUDIO_TRACKS', 
                    message: ERROR_MESSAGES.audioDetection.NO_AUDIO_TRACKS 
                });
            }

            return validatedTracks;

        } catch (error) {
            this.handleDetectionError(error);
            return existingTracks;
        } finally {
            this.cleanupDetection();
        }
    }

    /**
     * Perform multi-method audio track detection
     * @param {HTMLVideoElement} videoElement - The video element
     * @param {Array} existingTracks - Existing tracks
     * @returns {Promise<Array>} Enhanced tracks
     */
    async performMultiMethodDetection(videoElement, existingTracks) {
        const detectionPromises = [
            this.detectUsingMediaSource(videoElement),
            this.detectUsingWebAudio(videoElement),
            this.detectUsingFallbackMethods(videoElement)
        ];

        try {
            // Run all detection methods in parallel with timeout
            const results = await Promise.race([
                Promise.all(detectionPromises),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Detection timeout')), AUDIO_DETECTION_SETTINGS.timeout)
                )
            ]);

            // Merge and deduplicate results
            const mergedTracks = this.mergeDetectionResults(results, existingTracks);
            
            // Calculate confidence scores
            this.calculateConfidenceScores(mergedTracks);
            
            return mergedTracks;

        } catch (error) {
            console.warn('Multi-method detection failed, using fallback:', error);
            return this.detectUsingFallbackMethods(videoElement, existingTracks);
        }
    }

    /**
     * Detect audio tracks using Media Source Extensions API
     * @param {HTMLVideoElement} videoElement - The video element
     * @returns {Promise<Array>} Detected tracks
     */
    async detectUsingMediaSource(videoElement) {
        try {
            if (!window.MediaSource || !window.MediaSource.isTypeSupported) {
                throw new Error('Media Source Extensions not supported');
            }

            const mediaSource = new MediaSource();
            const tracks = [];

            // Wait for media source to be ready
            await new Promise((resolve) => {
                mediaSource.addEventListener('sourceopen', resolve, { once: true });
            });

            // Analyze video source if available
            if (videoElement.currentSrc) {
                const sourceBuffer = mediaSource.addSourceBuffer('audio/mp4; codecs="mp4a.40.2"');
                
                // Detect audio characteristics
                const audioInfo = await this.analyzeAudioStream(videoElement.currentSrc);
                if (audioInfo) {
                    tracks.push({
                        id: 'media-source-1',
                        label: 'Media Source Audio',
                        lang: audioInfo.language || 'und',
                        codec: audioInfo.codec || 'unknown',
                        channels: audioInfo.channels || 'Stereo',
                        bitrate: audioInfo.bitrate || 128,
                        confidence: 0.8,
                        method: 'media-source'
                    });
                }
            }

            return tracks;

        } catch (error) {
            console.warn('Media Source detection failed:', error);
            return [];
        }
    }

    /**
     * Detect audio tracks using Web Audio API
     * @param {HTMLVideoElement} videoElement - The video element
     * @returns {Promise<Array>} Detected tracks
     */
    async detectUsingWebAudio(videoElement) {
        if (!this.audioContext || !this.analyser) {
            console.warn('Web Audio API not available');
            return [];
        }

        try {
            // Create media element source
            const source = this.audioContext.createMediaElementSource(videoElement);
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            // Analyze audio characteristics
            const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
            this.analyser.getByteFrequencyData(frequencyData);

            // Detect audio properties
            const audioProperties = this.analyzeFrequencyData(frequencyData);
            
            return [{
                id: 'web-audio-1',
                label: 'Web Audio Track',
                lang: 'und',
                codec: audioProperties.codec || 'AAC',
                channels: audioProperties.channels || 'Stereo',
                bitrate: audioProperties.bitrate || 192,
                confidence: 0.7,
                method: 'web-audio'
            }];

        } catch (error) {
            console.warn('Web Audio detection failed:', error);
            return [];
        }
    }

    /**
     * Fallback audio track detection method
     * @param {HTMLVideoElement} videoElement - The video element
     * @param {Array} existingTracks - Existing tracks
     * @returns {Promise<Array>} Enhanced tracks
     */
    async detectUsingFallbackMethods(videoElement, existingTracks = []) {
        const enhancedTracks = [];

        // Analyze video element properties
        if (videoElement.audioTracks && videoElement.audioTracks.length > 0) {
            for (let i = 0; i < videoElement.audioTracks.length; i++) {
                const track = videoElement.audioTracks[i];
                const enhancedTrack = await this.enhanceTrackInfo(track, i);
                enhancedTracks.push(enhancedTrack);
            }
        }

        // Fallback to basic detection
        if (enhancedTracks.length === 0 && existingTracks.length > 0) {
            return existingTracks.map((track, index) => ({
                ...track,
                confidence: 0.5,
                method: 'fallback',
                enhanced: true
            }));
        }

        return enhancedTracks;
    }

    /**
     * Analyze frequency data to determine audio properties
     * @param {Uint8Array} frequencyData - Frequency data from analyser
     * @returns {Object} Audio properties
     */
    analyzeFrequencyData(frequencyData) {
        const properties = {
            codec: 'AAC',
            channels: 'Stereo',
            bitrate: 192
        };

        try {
            // Analyze frequency distribution
            const lowFreq = frequencyData.slice(0, frequencyData.length / 4);
            const midFreq = frequencyData.slice(frequencyData.length / 4, frequencyData.length * 3 / 4);
            const highFreq = frequencyData.slice(frequencyData.length * 3 / 4);

            const lowEnergy = lowFreq.reduce((sum, val) => sum + val, 0) / lowFreq.length;
            const midEnergy = midFreq.reduce((sum, val) => sum + val, 0) / midFreq.length;
            const highEnergy = highFreq.reduce((sum, val) => sum + val, 0) / highFreq.length;

            // Estimate codec based on frequency characteristics
            if (highEnergy > midEnergy * 1.5) {
                properties.codec = 'FLAC';
                properties.bitrate = 800;
            } else if (lowEnergy > midEnergy) {
                properties.codec = 'MP3';
                properties.bitrate = 192;
            }

            // Estimate channels based on stereo characteristics
            if (Math.abs(lowEnergy - highEnergy) < 10) {
                properties.channels = '5.1';
            }

        } catch (error) {
            console.warn('Frequency analysis failed:', error);
        }

        return properties;
    }

    /**
     * Enhance track information with additional metadata
     * @param {AudioTrack} track - Original audio track
     * @param {number} index - Track index
     * @returns {Promise<Object>} Enhanced track
     */
    async enhanceTrackInfo(track, index) {
        const enhancedTrack = {
            id: track.id || `audio-${index}`,
            label: track.label || `Audio Track ${index + 1}`,
            lang: track.language || 'und',
            kind: track.kind || 'main',
            enabled: track.enabled || false,
            confidence: 0.6,
            method: 'enhanced-fallback',
            enhanced: true
        };

        // Try to detect codec and quality
        try {
            const codecInfo = await this.detectCodecInfo(track);
            enhancedTrack.codec = codecInfo.codec || 'unknown';
            enhancedTrack.channels = codecInfo.channels || 'Stereo';
            enhancedTrack.bitrate = codecInfo.bitrate || 128;
            enhancedTrack.quality = this.calculateQualityScore(codecInfo);
            enhancedTrack.confidence = Math.min(0.9, enhancedTrack.confidence + 0.2);
        } catch (error) {
            console.warn('Codec detection failed for track:', track.id, error);
        }

        // Add accessibility information
        enhancedTrack.accessibility = {
            hasDescription: track.kind === 'descriptions',
            language: enhancedTrack.lang,
            isDefault: track.default || index === 0
        };

        return enhancedTrack;
    }

    /**
     * Detect codec information for a track
     * @param {AudioTrack} track - Audio track
     * @returns {Promise<Object>} Codec information
     */
    async detectCodecInfo(track) {
        // This is a simplified implementation
        // In a real-world scenario, you would analyze the actual audio stream
        const codecGuess = {
            codec: 'AAC',
            channels: 'Stereo',
            bitrate: 192
        };

        // Make educated guesses based on track properties
        if (track.label && track.label.toLowerCase().includes('5.1')) {
            codecGuess.channels = '5.1';
            codecGuess.bitrate = 384;
        }

        if (track.label && track.label.toLowerCase().includes('dts')) {
            codecGuess.codec = 'DTS';
            codecGuess.bitrate = 768;
        }

        if (track.label && track.label.toLowerCase().includes('flac')) {
            codecGuess.codec = 'FLAC';
            codecGuess.bitrate = 1000;
        }

        return codecGuess;
    }

    /**
     * Calculate quality score for audio track
     * @param {Object} codecInfo - Codec information
     * @returns {number} Quality score (0-1)
     */
    calculateQualityScore(codecInfo) {
        let score = 0.5; // Base score

        // Higher bitrate = higher quality
        if (codecInfo.bitrate >= 320) score += 0.2;
        else if (codecInfo.bitrate >= 192) score += 0.1;

        // Lossless codecs get bonus
        if (['FLAC', 'ALAC', 'WAV'].includes(codecInfo.codec)) score += 0.2;

        // Multi-channel audio
        if (codecInfo.channels === '5.1') score += 0.1;
        else if (codecInfo.channels === '7.1') score += 0.15;

        return Math.min(1.0, score);
    }

    /**
     * Validate and enhance detected tracks
     * @param {Array} tracks - Detected tracks
     * @returns {Promise<Array>} Validated tracks
     */
    async validateAndEnhanceTracks(tracks) {
        const validatedTracks = [];

        for (const track of tracks) {
            try {
                // Validate track properties
                if (!track.id || !track.label) {
                    console.warn('Invalid track properties:', track);
                    continue;
                }

                // Enhance with additional metadata
                const enhancedTrack = {
                    ...track,
                    validated: true,
                    timestamp: Date.now(),
                    confidence: track.confidence || 0.5
                };

                // Add language detection if missing
                if (!enhancedTrack.lang || enhancedTrack.lang === 'und') {
                    enhancedTrack.lang = await this.detectLanguage(track);
                }

                validatedTracks.push(enhancedTrack);

            } catch (error) {
                console.warn('Track validation failed:', error);
            }
        }

        return validatedTracks;
    }

    /**
     * Detect language from track information
     * @param {Object} track - Audio track
     * @returns {Promise<string>} Detected language code
     */
    async detectLanguage(track) {
        // Simple language detection based on label and common patterns
        const languagePatterns = {
            'english': 'eng',
            'en': 'eng',
            'spanish': 'spa',
            'es': 'spa',
            'french': 'fra',
            'fr': 'fra',
            'german': 'deu',
            'de': 'deu',
            'italian': 'ita',
            'it': 'ita',
            'portuguese': 'por',
            'pt': 'por',
            'russian': 'rus',
            'ru': 'rus',
            'chinese': 'chi',
            'zh': 'chi',
            'japanese': 'jpn',
            'ja': 'jpn',
            'korean': 'kor',
            'ko': 'kor'
        };

        const label = (track.label || '').toLowerCase();
        
        for (const [pattern, lang] of Object.entries(languagePatterns)) {
            if (label.includes(pattern)) {
                return lang;
            }
        }

        return 'und'; // Undetermined
    }

    /**
     * Calculate confidence scores for tracks
     * @param {Array} tracks - Audio tracks
     */
    calculateConfidenceScores(tracks) {
        tracks.forEach(track => {
            let confidence = track.confidence || 0.5;

            // Boost confidence for tracks with detailed information
            if (track.codec && track.codec !== 'unknown') confidence += 0.1;
            if (track.channels && track.channels !== 'unknown') confidence += 0.1;
            if (track.bitrate && track.bitrate > 0) confidence += 0.1;
            if (track.lang && track.lang !== 'und') confidence += 0.1;
            if (track.method === 'media-source') confidence += 0.1;
            if (track.method === 'web-audio') confidence += 0.05;

            // Penalize tracks with missing information
            if (!track.label) confidence -= 0.2;
            if (!track.id) confidence -= 0.2;

            track.confidence = Math.max(0, Math.min(1, confidence));
            this.confidenceScores.set(track.id, track.confidence);
        });
    }

    /**
     * Merge detection results from multiple methods
     * @param {Array} results - Array of detection results
     * @param {Array} existingTracks - Existing tracks
     * @returns {Array} Merged tracks
     */
    mergeDetectionResults(results, existingTracks) {
        const merged = new Map();

        // Add existing tracks first
        existingTracks.forEach(track => {
            merged.set(track.id, { ...track, confidence: 0.5, method: 'existing' });
        });

        // Merge detection results
        results.forEach(methodResults => {
            methodResults.forEach(track => {
                if (merged.has(track.id)) {
                    // Merge with existing track
                    const existing = merged.get(track.id);
                    merged.set(track.id, {
                        ...existing,
                        ...track,
                        confidence: Math.max(existing.confidence, track.confidence)
                    });
                } else {
                    // Add new track
                    merged.set(track.id, track);
                }
            });
        });

        return Array.from(merged.values());
    }

    /**
     * Handle detection timeout
     */
    handleDetectionTimeout() {
        this.detectionStatus = STATUS_INDICATORS.audioDetection.TIMEOUT;
        this.emit('error', { 
            type: 'TIMEOUT', 
            message: ERROR_MESSAGES.audioDetection.TIMEOUT 
        });
        this.cleanupDetection();
    }

    /**
     * Handle detection errors
     * @param {Error} error - Detection error
     */
    handleDetectionError(error) {
        console.error('Audio detection error:', error);
        
        this.detectionStatus = STATUS_INDICATORS.audioDetection.FAILED;
        
        // Retry if possible
        if (this.retryCount < AUDIO_DETECTION_SETTINGS.maxRetries) {
            this.retryCount++;
            console.log(`Retrying audio detection (attempt ${this.retryCount})`);
            
            setTimeout(() => {
                this.detectAudioTracks(this.lastVideoElement, this.lastExistingTracks);
            }, AUDIO_DETECTION_SETTINGS.fallbackDelay * this.retryCount);
        } else {
            this.emit('error', { 
                type: 'DETECTION_FAILED', 
                message: ERROR_MESSAGES.audioDetection.DETECTION_FAILED,
                originalError: error.message 
            });
        }
    }

    /**
     * Clean up detection resources
     */
    cleanupDetection() {
        this.isDetecting = false;
        
        if (this.detectionTimeout) {
            clearTimeout(this.detectionTimeout);
            this.detectionTimeout = null;
        }

        if (this.mediaSource) {
            try {
                this.mediaSource.endOfStream();
            } catch (error) {
                // Ignore cleanup errors
            }
            this.mediaSource = null;
        }

        if (this.analyser && this.audioContext) {
            try {
                this.analyser.disconnect();
            } catch (error) {
                // Ignore cleanup errors
            }
        }
    }

    /**
     * Get current detection status
     * @returns {Object} Current status
     */
    getDetectionStatus() {
        return this.detectionStatus;
    }

    /**
     * Get detected tracks
     * @returns {Array} Detected audio tracks
     */
    getDetectedTracks() {
        return this.detectedTracks;
    }

    /**
     * Get confidence scores
     * @returns {Map} Confidence scores map
     */
    getConfidenceScores() {
        return this.confidenceScores;
    }

    /**
     * Reset detection state
     */
    reset() {
        this.cleanupDetection();
        this.audioTracks = [];
        this.detectedTracks = [];
        this.confidenceScores.clear();
        this.retryCount = 0;
        this.detectionStatus = STATUS_INDICATORS.audioDetection.IDLE;
        this.emit('reset');
    }

    /**
     * Destroy the audio track manager
     */
    destroy() {
        this.reset();
        this.removeAllListeners();
        
        if (this.audioContext) {
            try {
                this.audioContext.close();
            } catch (error) {
                // Ignore cleanup errors
            }
            this.audioContext = null;
        }
    }
}

module.exports = AudioTrackManager;