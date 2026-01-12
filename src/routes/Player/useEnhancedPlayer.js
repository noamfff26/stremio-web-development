// Copyright (C) 2024 Stremio UI/UX Enhancement
// Enhanced Player Hook with Advanced Subtitle and Audio Management

const React = require('react');
const EventEmitter = require('eventemitter3');
const AudioTrackManager = require('stremio/routes/Player/AudioTrackManager/AudioTrackManager');
const SubtitleManager = require('stremio/routes/Player/SubtitleManager/SubtitleManager');
const { SUBTITLE_PRESETS, STATUS_INDICATORS } = require('stremio/common/ENHANCED_CONSTANTS');

const events = new EventEmitter();

const useEnhancedPlayer = () => {
    const audioTrackManager = React.useRef(null);
    const subtitleManager = React.useRef(null);
    
    const [state, setState] = React.useState({
        // Enhanced subtitle styling
        subtitlesSize: 100,
        subtitlesTextColor: '#FFFFFF',
        subtitlesBackgroundColor: '#000000',
        subtitlesBackgroundOpacity: 0.8,
        subtitlesOutlineColor: '#000000',
        subtitlesOutlineSize: 1,
        subtitlesFont: 'Arial',
        subtitlesOffset: 50,
        subtitlesDelay: 0,
        
        // Extra subtitles styling
        extraSubtitlesSize: 100,
        extraSubtitlesTextColor: '#FFFFFF',
        extraSubtitlesBackgroundColor: '#000000',
        extraSubtitlesOutlineColor: '#000000',
        extraSubtitlesOffset: 50,
        extraSubtitlesDelay: 0,
        
        // Audio track management
        audioTracks: [],
        selectedAudioTrackId: null,
        audioDetectionStatus: STATUS_INDICATORS.audioDetection.IDLE,
        
        // Subtitle processing
        subtitlesTracks: [],
        selectedSubtitlesTrackId: null,
        extraSubtitlesTracks: [],
        selectedExtraSubtitlesTrackId: null,
        subtitleProcessingStatus: STATUS_INDICATORS.subtitleProcessing.IDLE,
        
        // File upload and processing
        uploadedSubtitles: [],
        isProcessingFile: false,
        processingError: null,
        
        // Preset management
        activePreset: 'default',
        customPresets: {},
        
        // Status indicators
        isEnhancedMode: false,
        performanceMetrics: {
            processingTime: 0,
            memoryUsage: 0,
            errorCount: 0
        }
    });

    // Initialize managers
    React.useEffect(() => {
        audioTrackManager.current = new AudioTrackManager();
        subtitleManager.current = new SubtitleManager();

        // Set up event listeners
        audioTrackManager.current.on('statusChange', (status) => {
            setState(prev => ({
                ...prev,
                audioDetectionStatus: status
            }));
        });

        audioTrackManager.current.on('tracksDetected', (tracks) => {
            setState(prev => ({
                ...prev,
                audioTracks: tracks
            }));
        });

        audioTrackManager.current.on('error', (error) => {
            console.error('Audio track detection error:', error);
            setState(prev => ({
                ...prev,
                performanceMetrics: {
                    ...prev.performanceMetrics,
                    errorCount: prev.performanceMetrics.errorCount + 1
                }
            }));
        });

        subtitleManager.current.on('statusChange', (status) => {
            setState(prev => ({
                ...prev,
                subtitleProcessingStatus: status
            }));
        });

        subtitleManager.current.on('error', (error) => {
            console.error('Subtitle processing error:', error);
            setState(prev => ({
                ...prev,
                processingError: error.message,
                performanceMetrics: {
                    ...prev.performanceMetrics,
                    errorCount: prev.performanceMetrics.errorCount + 1
                }
            }));
        });

        return () => {
            if (audioTrackManager.current) {
                audioTrackManager.current.destroy();
            }
            if (subtitleManager.current) {
                subtitleManager.current.destroy();
            }
        };
    }, []);

    /**
     * Enhanced subtitle styling methods
     */
    const setSubtitlesSize = React.useCallback((size) => {
        setState(prev => ({ ...prev, subtitlesSize: size }));
        events.emit('subtitlesSizeChanged', size);
    }, []);

    const setSubtitlesTextColor = React.useCallback((color) => {
        setState(prev => ({ ...prev, subtitlesTextColor: color }));
        events.emit('subtitlesTextColorChanged', color);
    }, []);

    const setSubtitlesBackgroundColor = React.useCallback((color) => {
        setState(prev => ({ ...prev, subtitlesBackgroundColor: color }));
        events.emit('subtitlesBackgroundColorChanged', color);
    }, []);

    const setSubtitlesBackgroundOpacity = React.useCallback((opacity) => {
        setState(prev => ({ ...prev, subtitlesBackgroundOpacity: opacity }));
        events.emit('subtitlesBackgroundOpacityChanged', opacity);
    }, []);

    const setSubtitlesOutlineColor = React.useCallback((color) => {
        setState(prev => ({ ...prev, subtitlesOutlineColor: color }));
        events.emit('subtitlesOutlineColorChanged', color);
    }, []);

    const setSubtitlesOutlineSize = React.useCallback((size) => {
        setState(prev => ({ ...prev, subtitlesOutlineSize: size }));
        events.emit('subtitlesOutlineSizeChanged', size);
    }, []);

    const setSubtitlesFont = React.useCallback((font) => {
        setState(prev => ({ ...prev, subtitlesFont: font }));
        events.emit('subtitlesFontChanged', font);
    }, []);

    const setSubtitlesOffset = React.useCallback((offset) => {
        setState(prev => ({ ...prev, subtitlesOffset: offset }));
        events.emit('subtitlesOffsetChanged', offset);
    }, []);

    const setSubtitlesDelay = React.useCallback((delay) => {
        setState(prev => ({ ...prev, subtitlesDelay: delay }));
        events.emit('subtitlesDelayChanged', delay);
    }, []);

    /**
     * Extra subtitles styling methods
     */
    const setExtraSubtitlesSize = React.useCallback((size) => {
        setState(prev => ({ ...prev, extraSubtitlesSize: size }));
        events.emit('extraSubtitlesSizeChanged', size);
    }, []);

    const setExtraSubtitlesTextColor = React.useCallback((color) => {
        setState(prev => ({ ...prev, extraSubtitlesTextColor: color }));
        events.emit('extraSubtitlesTextColorChanged', color);
    }, []);

    const setExtraSubtitlesBackgroundColor = React.useCallback((color) => {
        setState(prev => ({ ...prev, extraSubtitlesBackgroundColor: color }));
        events.emit('extraSubtitlesBackgroundColorChanged', color);
    }, []);

    const setExtraSubtitlesOutlineColor = React.useCallback((color) => {
        setState(prev => ({ ...prev, extraSubtitlesOutlineColor: color }));
        events.emit('extraSubtitlesOutlineColorChanged', color);
    }, []);

    const setExtraSubtitlesOffset = React.useCallback((offset) => {
        setState(prev => ({ ...prev, extraSubtitlesOffset: offset }));
        events.emit('extraSubtitlesOffsetChanged', offset);
    }, []);

    const setExtraSubtitlesDelay = React.useCallback((delay) => {
        setState(prev => ({ ...prev, extraSubtitlesDelay: delay }));
        events.emit('extraSubtitlesDelayChanged', delay);
    }, []);

    /**
     * Audio track management methods
     */
    const detectAudioTracks = React.useCallback(async (videoElement, existingTracks = []) => {
        if (!audioTrackManager.current) return existingTracks;

        const startTime = performance.now();
        
        try {
            const enhancedTracks = await audioTrackManager.current.detectAudioTracks(videoElement, existingTracks);
            
            const endTime = performance.now();
            setState(prev => ({
                ...prev,
                performanceMetrics: {
                    ...prev.performanceMetrics,
                    processingTime: endTime - startTime
                }
            }));
            
            return enhancedTracks;
        } catch (error) {
            console.error('Audio track detection failed:', error);
            return existingTracks;
        }
    }, []);

    const selectAudioTrack = React.useCallback((trackId) => {
        setState(prev => ({ ...prev, selectedAudioTrackId: trackId }));
        events.emit('audioTrackSelected', trackId);
    }, []);

    /**
     * Subtitle file upload and processing
     */
    const uploadSubtitleFile = React.useCallback(async (file) => {
        if (!subtitleManager.current) return;

        setState(prev => ({ 
            ...prev, 
            isProcessingFile: true, 
            processingError: null 
        }));

        const startTime = performance.now();

        try {
            const result = await subtitleManager.current.processSubtitleFile(file);
            
            const endTime = performance.now();
            
            if (result.success) {
                setState(prev => ({
                    ...prev,
                    uploadedSubtitles: [...prev.uploadedSubtitles, result],
                    isProcessingFile: false,
                    performanceMetrics: {
                        ...prev.performanceMetrics,
                        processingTime: endTime - startTime
                    }
                }));
                
                events.emit('subtitleFileProcessed', result);
            } else {
                setState(prev => ({
                    ...prev,
                    isProcessingFile: false,
                    processingError: result.error,
                    performanceMetrics: {
                        ...prev.performanceMetrics,
                        errorCount: prev.performanceMetrics.errorCount + 1
                    }
                }));
            }
            
            return result;
        } catch (error) {
            console.error('Subtitle file processing failed:', error);
            setState(prev => ({
                ...prev,
                isProcessingFile: false,
                processingError: error.message,
                performanceMetrics: {
                    ...prev.performanceMetrics,
                    errorCount: prev.performanceMetrics.errorCount + 1
                }
            }));
            
            return { success: false, error: error.message };
        }
    }, []);

    /**
     * Preset management methods
     */
    const applyPreset = React.useCallback((presetKey) => {
        const preset = SUBTITLE_PRESETS[presetKey];
        if (!preset) return;

        setState(prev => ({
            ...prev,
            activePreset: presetKey,
            subtitlesTextColor: preset.textColor,
            subtitlesBackgroundColor: preset.backgroundColor,
            subtitlesBackgroundOpacity: preset.backgroundOpacity,
            subtitlesOutlineColor: preset.outlineColor,
            subtitlesOutlineSize: preset.outlineSize,
            subtitlesFont: preset.font,
            subtitlesSize: preset.size
        }));

        events.emit('presetApplied', presetKey);
    }, []);

    const saveCustomPreset = React.useCallback((name, settings) => {
        setState(prev => ({
            ...prev,
            customPresets: {
                ...prev.customPresets,
                [name]: settings
            }
        }));
    }, []);

    const deleteCustomPreset = React.useCallback((name) => {
        setState(prev => {
            const newPresets = { ...prev.customPresets };
            delete newPresets[name];
            return {
                ...prev,
                customPresets: newPresets
            };
        });
    }, []);

    /**
     * Reset to default settings
     */
    const resetToDefaults = React.useCallback(() => {
        applyPreset('default');
        setState(prev => ({
            ...prev,
            subtitlesOffset: 50,
            subtitlesDelay: 0,
            extraSubtitlesOffset: 50,
            extraSubtitlesDelay: 0,
            activePreset: 'default'
        }));
        
        events.emit('resetToDefaults');
    }, [applyPreset]);

    /**
     * Convert between subtitle formats
     */
    const convertSubtitles = React.useCallback(async (subtitles, targetFormat) => {
        if (!subtitleManager.current) return subtitles;
        
        try {
            const converted = await subtitleManager.current.convertSubtitles(subtitles, targetFormat);
            events.emit('subtitlesConverted', { original: subtitles, converted, targetFormat });
            return converted;
        } catch (error) {
            console.error('Subtitle conversion failed:', error);
            return subtitles;
        }
    }, []);

    /**
     * Performance monitoring
     */
    const getPerformanceMetrics = React.useCallback(() => {
        return state.performanceMetrics;
    }, [state.performanceMetrics]);

    /**
     * Toggle enhanced mode
     */
    const toggleEnhancedMode = React.useCallback(() => {
        setState(prev => ({
            ...prev,
            isEnhancedMode: !prev.isEnhancedMode
        }));
    }, []);

    return {
        // State
        state,
        
        // Enhanced subtitle styling methods
        setSubtitlesSize,
        setSubtitlesTextColor,
        setSubtitlesBackgroundColor,
        setSubtitlesBackgroundOpacity,
        setSubtitlesOutlineColor,
        setSubtitlesOutlineSize,
        setSubtitlesFont,
        setSubtitlesOffset,
        setSubtitlesDelay,
        
        // Extra subtitles styling methods
        setExtraSubtitlesSize,
        setExtraSubtitlesTextColor,
        setExtraSubtitlesBackgroundColor,
        setExtraSubtitlesOutlineColor,
        setExtraSubtitlesOffset,
        setExtraSubtitlesDelay,
        
        // Audio track management
        detectAudioTracks,
        selectAudioTrack,
        
        // Subtitle file processing
        uploadSubtitleFile,
        convertSubtitles,
        
        // Preset management
        applyPreset,
        saveCustomPreset,
        deleteCustomPreset,
        resetToDefaults,
        
        // Performance monitoring
        getPerformanceMetrics,
        toggleEnhancedMode,
        
        // Events
        events
    };
};

module.exports = useEnhancedPlayer;