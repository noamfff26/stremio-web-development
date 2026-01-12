// Copyright (C) 2024 Stremio UI/UX Enhancement
// Enhanced Player Integration Component - Main Integration Point

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import AdvancedSubtitlesMenu from 'stremio/routes/Player/AdvancedSubtitlesMenu/AdvancedSubtitlesMenu';
import useEnhancedPlayer from 'stremio/routes/Player/useEnhancedPlayer';
import { Button, Icon, LoadingSpinner } from 'stremio/components';
import { useScreenReader } from 'stremio/common/accessibility';
import { motion, screenReader } from 'stremio/common/accessibility/utils';
import { STATUS_INDICATORS } from 'stremio/common/ENHANCED_CONSTANTS';
import styles from './EnhancedPlayerIntegration.less';

type Props = {
    className?: string,
    videoElement?: HTMLVideoElement | null,
    subtitlesTracks: Array<any>,
    selectedSubtitlesTrackId: string | null,
    audioTracks: Array<any>,
    selectedAudioTrackId: string | null,
    onSubtitlesTrackSelected: (id: string | null) => void,
    onAudioTrackSelected: (id: string | null) => void,
    onExtraSubtitlesTrackSelected: (id: string | null) => void,
    // Additional props for styling callbacks
    onSubtitlesSizeChanged?: (size: number) => void,
    onSubtitlesTextColorChanged?: (color: string) => void,
    onSubtitlesBackgroundColorChanged?: (color: string) => void,
    onSubtitlesBackgroundOpacityChanged?: (opacity: number) => void,
    onSubtitlesOutlineColorChanged?: (color: string) => void,
    onSubtitlesOutlineSizeChanged?: (size: number) => void,
    onSubtitlesFontChanged?: (font: string) => void,
    onSubtitlesOffsetChanged?: (offset: number) => void,
    onSubtitlesDelayChanged?: (delay: number) => void,
    onExtraSubtitlesSizeChanged?: (size: number) => void,
    onExtraSubtitlesTextColorChanged?: (color: string) => void,
    onExtraSubtitlesBackgroundColorChanged?: (color: string) => void,
    onExtraSubtitlesOutlineColorChanged?: (color: string) => void,
    onExtraSubtitlesOffsetChanged?: (offset: number) => void,
    onExtraSubtitlesDelayChanged?: (delay: number) => void
};

const EnhancedPlayerIntegration = ({
    className,
    videoElement,
    subtitlesTracks,
    selectedSubtitlesTrackId,
    audioTracks,
    selectedAudioTrackId,
    onSubtitlesTrackSelected,
    onAudioTrackSelected,
    onExtraSubtitlesTrackSelected,
    // Styling callbacks
    onSubtitlesSizeChanged,
    onSubtitlesTextColorChanged,
    onSubtitlesBackgroundColorChanged,
    onSubtitlesBackgroundOpacityChanged,
    onSubtitlesOutlineColorChanged,
    onSubtitlesOutlineSizeChanged,
    onSubtitlesFontChanged,
    onSubtitlesOffsetChanged,
    onSubtitlesDelayChanged,
    onExtraSubtitlesSizeChanged,
    onExtraSubtitlesTextColorChanged,
    onExtraSubtitlesBackgroundColorChanged,
    onExtraSubtitlesOutlineColorChanged,
    onExtraSubtitlesOffsetChanged,
    onExtraSubtitlesDelayChanged
}: Props) => {
    const { t } = useTranslation();
    const [isAdvancedMenuOpen, setIsAdvancedMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('main');
    const [showStatusPanel, setShowStatusPanel] = useState(false);
    const reducedMotion = motion.prefersReducedMotion();
    
    // Initialize enhanced player hook
    const enhancedPlayer = useEnhancedPlayer();
    
    // Screen reader announcements
    useScreenReader(
        isAdvancedMenuOpen ? t('ADVANCED_SUBTITLE_MENU_OPENED') : t('ENHANCED_PLAYER_CONTROLS'),
        'polite',
        500
    );
    
    /**
     * Handle subtitle file upload
     */
    const handleSubtitleFileUpload = useCallback(async (file: File) => {
        try {
            const result = await enhancedPlayer.uploadSubtitleFile(file);
            
            if (result.success) {
                // Process successful upload
                console.log('Subtitle file uploaded successfully:', result);
                
                // Add to extra subtitles tracks if needed
                if (result.subtitles && result.subtitles.length > 0) {
                    const newTrack = {
                        id: `uploaded-${Date.now()}`,
                        label: result.metadata.fileName,
                        lang: 'und',
                        origin: 'UPLOADED',
                        embedded: false,
                        subtitles: result.subtitles,
                        format: result.format
                    };
                    
                    // Add to extra subtitles tracks
                    enhancedPlayer.state.extraSubtitlesTracks = [
                        ...enhancedPlayer.state.extraSubtitlesTracks,
                        newTrack
                    ];
                    
                    // Auto-select the uploaded track
                if (onExtraSubtitlesTrackSelected) {
                    onExtraSubtitlesTrackSelected(newTrack.id);
                }
            }

            screenReader.announce(
                t('SUBTITLE_FILE_UPLOAD_SUCCESS', { fileName: result.metadata.fileName }),
                'assertive'
            );
        } else {
            console.error('Subtitle file upload failed:', result.error);

            screenReader.announce(
                t('SUBTITLE_FILE_UPLOAD_FAILED', { error: result.error }),
                'assertive'
            );
        }
            
            return result;
        } catch (error) {
            console.error('Error uploading subtitle file:', error);

            screenReader.announce(
                t('SUBTITLE_FILE_UPLOAD_ERROR', { error: error.message }),
                'assertive'
            );
            
            return { success: false, error: error.message };
        }
    }, [enhancedPlayer, onExtraSubtitlesTrackSelected, t]);
    
    /**
     * Handle preset selection
     */
    const handlePresetSelected = useCallback((presetKey: string) => {
        enhancedPlayer.applyPreset(presetKey);
        
        // Apply preset to external callbacks
        const preset = enhancedPlayer.state.activePreset;
        if (preset && preset !== 'custom') {
            const presetData = enhancedPlayer.state.customPresets[preset] || 
                              require('stremio/common/ENHANCED_CONSTANTS').SUBTITLE_PRESETS[preset];
            
            if (presetData) {
                onSubtitlesTextColorChanged?.(presetData.textColor);
                onSubtitlesBackgroundColorChanged?.(presetData.backgroundColor);
                onSubtitlesBackgroundOpacityChanged?.(presetData.backgroundOpacity);
                onSubtitlesOutlineColorChanged?.(presetData.outlineColor);
                onSubtitlesOutlineSizeChanged?.(presetData.outlineSize);
                onSubtitlesFontChanged?.(presetData.font);
                onSubtitlesSizeChanged?.(presetData.size);
            }
        }
        
        screenReader.announce(
            t('SUBTITLE_PRESET_APPLIED', { preset: presetKey }),
            'polite'
        );
    }, [enhancedPlayer, onSubtitlesTextColorChanged, onSubtitlesBackgroundColorChanged, 
          onSubtitlesBackgroundOpacityChanged, onSubtitlesOutlineColorChanged, 
          onSubtitlesOutlineSizeChanged, onSubtitlesFontChanged, onSubtitlesSizeChanged, t]);
    
    /**
     * Handle reset to defaults
     */
    const handleResetToDefaults = useCallback(() => {
        enhancedPlayer.resetToDefaults();
        
        // Reset external callbacks
        onSubtitlesSizeChanged?.(100);
        onSubtitlesTextColorChanged?.('#FFFFFF');
        onSubtitlesBackgroundColorChanged?.('#000000');
        onSubtitlesBackgroundOpacityChanged?.(0.8);
        onSubtitlesOutlineColorChanged?.('#000000');
        onSubtitlesOutlineSizeChanged?.(1);
        onSubtitlesFontChanged?.('Arial');
        onSubtitlesOffsetChanged?.(50);
        onSubtitlesDelayChanged?.(0);
        
        // Reset extra subtitles
        onExtraSubtitlesSizeChanged?.(100);
        onExtraSubtitlesTextColorChanged?.('#FFFFFF');
        onExtraSubtitlesBackgroundColorChanged?.('#000000');
        onExtraSubtitlesOutlineColorChanged?.('#000000');
        onExtraSubtitlesOffsetChanged?.(50);
        onExtraSubtitlesDelayChanged?.(0);
        
        screenReader.announce(t('SUBTITLE_SETTINGS_RESET'), 'polite');
    }, [enhancedPlayer, onSubtitlesSizeChanged, onSubtitlesTextColorChanged, 
          onSubtitlesBackgroundColorChanged, onSubtitlesBackgroundOpacityChanged,
          onSubtitlesOutlineColorChanged, onSubtitlesOutlineSizeChanged,
          onSubtitlesFontChanged, onSubtitlesOffsetChanged, onSubtitlesDelayChanged,
          onExtraSubtitlesSizeChanged, onExtraSubtitlesTextColorChanged,
          onExtraSubtitlesBackgroundColorChanged, onExtraSubtitlesOutlineColorChanged,
          onExtraSubtitlesOffsetChanged, onExtraSubtitlesDelayChanged, t]);
    
    /**
     * Handle audio track detection
     */
    const handleDetectAudioTracks = useCallback(async () => {
        if (!videoElement) return;
        
        try {
            const enhancedTracks = await enhancedPlayer.detectAudioTracks(videoElement, audioTracks);
            
            if (enhancedTracks.length > 0) {
                console.log('Enhanced audio tracks detected:', enhancedTracks);
                
                // Update audio tracks with enhanced information
                // This would typically be handled by the parent component
                enhancedPlayer.events.emit('audioTracksEnhanced', enhancedTracks);
            }
        } catch (error) {
            console.error('Audio track detection failed:', error);
        }
    }, [enhancedPlayer, videoElement, audioTracks]);
    
    /**
     * Enhanced subtitle styling handlers
     */
    const handleSubtitlesSizeChanged = useCallback((size: number) => {
        enhancedPlayer.setSubtitlesSize(size);
        onSubtitlesSizeChanged?.(size);
    }, [enhancedPlayer, onSubtitlesSizeChanged]);
    
    const handleSubtitlesTextColorChanged = useCallback((color: string) => {
        enhancedPlayer.setSubtitlesTextColor(color);
        onSubtitlesTextColorChanged?.(color);
    }, [enhancedPlayer, onSubtitlesTextColorChanged]);
    
    const handleSubtitlesBackgroundColorChanged = useCallback((color: string) => {
        enhancedPlayer.setSubtitlesBackgroundColor(color);
        onSubtitlesBackgroundColorChanged?.(color);
    }, [enhancedPlayer, onSubtitlesBackgroundColorChanged]);
    
    const handleSubtitlesBackgroundOpacityChanged = useCallback((opacity: number) => {
        enhancedPlayer.setSubtitlesBackgroundOpacity(opacity);
        onSubtitlesBackgroundOpacityChanged?.(opacity);
    }, [enhancedPlayer, onSubtitlesBackgroundOpacityChanged]);
    
    const handleSubtitlesOutlineColorChanged = useCallback((color: string) => {
        enhancedPlayer.setSubtitlesOutlineColor(color);
        onSubtitlesOutlineColorChanged?.(color);
    }, [enhancedPlayer, onSubtitlesOutlineColorChanged]);
    
    const handleSubtitlesOutlineSizeChanged = useCallback((size: number) => {
        enhancedPlayer.setSubtitlesOutlineSize(size);
        onSubtitlesOutlineSizeChanged?.(size);
    }, [enhancedPlayer, onSubtitlesOutlineSizeChanged]);
    
    const handleSubtitlesFontChanged = useCallback((font: string) => {
        enhancedPlayer.setSubtitlesFont(font);
        onSubtitlesFontChanged?.(font);
    }, [enhancedPlayer, onSubtitlesFontChanged]);
    
    const handleSubtitlesOffsetChanged = useCallback((offset: number) => {
        enhancedPlayer.setSubtitlesOffset(offset);
        onSubtitlesOffsetChanged?.(offset);
    }, [enhancedPlayer, onSubtitlesOffsetChanged]);
    
    const handleSubtitlesDelayChanged = useCallback((delay: number) => {
        enhancedPlayer.setSubtitlesDelay(delay);
        onSubtitlesDelayChanged?.(delay);
    }, [enhancedPlayer, onSubtitlesDelayChanged]);
    
    /**
     * Extra subtitle styling handlers
     */
    const handleExtraSubtitlesSizeChanged = useCallback((size: number) => {
        enhancedPlayer.setExtraSubtitlesSize(size);
        onExtraSubtitlesSizeChanged?.(size);
    }, [enhancedPlayer, onExtraSubtitlesSizeChanged]);
    
    const handleExtraSubtitlesTextColorChanged = useCallback((color: string) => {
        enhancedPlayer.setExtraSubtitlesTextColor(color);
        onExtraSubtitlesTextColorChanged?.(color);
    }, [enhancedPlayer, onExtraSubtitlesTextColorChanged]);
    
    const handleExtraSubtitlesBackgroundColorChanged = useCallback((color: string) => {
        enhancedPlayer.setExtraSubtitlesBackgroundColor(color);
        onExtraSubtitlesBackgroundColorChanged?.(color);
    }, [enhancedPlayer, onExtraSubtitlesBackgroundColorChanged]);
    
    const handleExtraSubtitlesOutlineColorChanged = useCallback((color: string) => {
        enhancedPlayer.setExtraSubtitlesOutlineColor(color);
        onExtraSubtitlesOutlineColorChanged?.(color);
    }, [enhancedPlayer, onExtraSubtitlesOutlineColorChanged]);
    
    const handleExtraSubtitlesOffsetChanged = useCallback((offset: number) => {
        enhancedPlayer.setExtraSubtitlesOffset(offset);
        onExtraSubtitlesOffsetChanged?.(offset);
    }, [enhancedPlayer, onExtraSubtitlesOffsetChanged]);
    
    const handleExtraSubtitlesDelayChanged = useCallback((delay: number) => {
        enhancedPlayer.setExtraSubtitlesDelay(delay);
        onExtraSubtitlesDelayChanged?.(delay);
    }, [enhancedPlayer, onExtraSubtitlesDelayChanged]);
    
    /**
     * Get current status information
     */
    const getStatusInfo = useCallback(() => {
        const { audioDetectionStatus, subtitleProcessingStatus, isProcessingFile, processingError } = enhancedPlayer.state;
        
        return {
            audio: audioDetectionStatus,
            subtitles: subtitleProcessingStatus,
            fileProcessing: isProcessingFile,
            error: processingError
        };
    }, [enhancedPlayer.state]);
    
    /**
     * Get performance metrics
     */
    const getPerformanceMetrics = useCallback(() => {
        return enhancedPlayer.getPerformanceMetrics();
    }, [enhancedPlayer]);
    
    return (
        <div className={classNames(className, styles['enhanced-player-integration'])}>
            {/* Main Control Panel */}
            <div className={styles['main-controls']}>
                <div className={styles['control-sections']}>
                    {/* Quick Actions */}
                    <div className={styles['quick-actions']}>
                        <Button
                            className={styles['advanced-menu-button']}
                            onClick={() => setIsAdvancedMenuOpen(!isAdvancedMenuOpen)}
                            aria-label={t('OPEN_ADVANCED_SUBTITLE_MENU')}
                            title={t('ADVANCED_SUBTITLE_SETTINGS')}
                        >
                            <Icon name="settings" className={styles['icon']} />
                            <span className={styles['button-text']}>{t('ADVANCED')}</span>
                        </Button>
                        
                        <Button
                            className={styles['detect-audio-button']}
                            onClick={handleDetectAudioTracks}
                            disabled={!videoElement}
                            aria-label={t('DETECT_AUDIO_TRACKS')}
                            title={t('DETECT_AUDIO_TRACKS')}
                        >
                            <Icon name="volume-up" className={styles['icon']} />
                            <span className={styles['button-text']}>{t('DETECT_AUDIO')}</span>
                        </Button>
                        
                        <Button
                            className={styles['status-button']}
                            onClick={() => setShowStatusPanel(!showStatusPanel)}
                            aria-label={t('SHOW_STATUS_PANEL')}
                            title={t('STATUS_PANEL')}
                        >
                            <Icon name="info" className={styles['icon']} />
                            <span className={styles['button-text']}>{t('STATUS')}</span>
                        </Button>
                    </div>
                    
                    {/* Status Indicators */}
                    <div className={styles['status-indicators']}>
                        {enhancedPlayer.state.isProcessingFile && (
                            <div className={styles['processing-indicator']}>
                                <LoadingSpinner size="small" />
                                <span className={styles['status-text']}>{t('PROCESSING_FILE')}</span>
                            </div>
                        )}
                        
                        {enhancedPlayer.state.processingError && (
                            <div className={styles['error-indicator']} role="alert">
                                <Icon name="error" className={styles['error-icon']} />
                                <span className={styles['error-text']}>
                                    {t('PROCESSING_ERROR', { error: enhancedPlayer.state.processingError })}
                                </span>
                            </div>
                        )}
                        
                        {enhancedPlayer.state.isEnhancedMode && (
                            <div className={styles['enhanced-mode-indicator']}>
                                <Icon name="star" className={styles['enhanced-icon']} />
                                <span className={styles['enhanced-text']}>{t('ENHANCED_MODE')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Advanced Subtitles Menu */}
            {isAdvancedMenuOpen && (
                <div className={styles['advanced-menu-container']}>
                    <AdvancedSubtitlesMenu
                        className={styles['advanced-subtitles-menu']}
                        subtitlesTracks={subtitlesTracks}
                        selectedSubtitlesTrackId={selectedSubtitlesTrackId}
                        subtitlesSize={enhancedPlayer.state.subtitlesSize}
                        subtitlesTextColor={enhancedPlayer.state.subtitlesTextColor}
                        subtitlesBackgroundColor={enhancedPlayer.state.subtitlesBackgroundColor}
                        subtitlesBackgroundOpacity={enhancedPlayer.state.subtitlesBackgroundOpacity}
                        subtitlesOutlineColor={enhancedPlayer.state.subtitlesOutlineColor}
                        subtitlesOutlineSize={enhancedPlayer.state.subtitlesOutlineSize}
                        subtitlesFont={enhancedPlayer.state.subtitlesFont}
                        subtitlesOffset={enhancedPlayer.state.subtitlesOffset}
                        subtitlesDelay={enhancedPlayer.state.subtitlesDelay}
                        extraSubtitlesTracks={enhancedPlayer.state.extraSubtitlesTracks}
                        selectedExtraSubtitlesTrackId={enhancedPlayer.state.selectedExtraSubtitlesTrackId}
                        extraSubtitlesSize={enhancedPlayer.state.extraSubtitlesSize}
                        extraSubtitlesTextColor={enhancedPlayer.state.extraSubtitlesTextColor}
                        extraSubtitlesBackgroundColor={enhancedPlayer.state.extraSubtitlesBackgroundColor}
                        extraSubtitlesOutlineColor={enhancedPlayer.state.extraSubtitlesOutlineColor}
                        extraSubtitlesOffset={enhancedPlayer.state.extraSubtitlesOffset}
                        extraSubtitlesDelay={enhancedPlayer.state.extraSubtitlesDelay}
                        audioTracks={enhancedPlayer.state.audioTracks.length > 0 ? enhancedPlayer.state.audioTracks : audioTracks}
                        selectedAudioTrackId={selectedAudioTrackId}
                        onSubtitlesTrackSelected={onSubtitlesTrackSelected}
                        onExtraSubtitlesTrackSelected={onExtraSubtitlesTrackSelected}
                        onAudioTrackSelected={onAudioTrackSelected}
                        onSubtitlesSizeChanged={handleSubtitlesSizeChanged}
                        onSubtitlesTextColorChanged={handleSubtitlesTextColorChanged}
                        onSubtitlesBackgroundColorChanged={handleSubtitlesBackgroundColorChanged}
                        onSubtitlesBackgroundOpacityChanged={handleSubtitlesBackgroundOpacityChanged}
                        onSubtitlesOutlineColorChanged={handleSubtitlesOutlineColorChanged}
                        onSubtitlesOutlineSizeChanged={handleSubtitlesOutlineSizeChanged}
                        onSubtitlesFontChanged={handleSubtitlesFontChanged}
                        onSubtitlesOffsetChanged={handleSubtitlesOffsetChanged}
                        onSubtitlesDelayChanged={handleSubtitlesDelayChanged}
                        onExtraSubtitlesSizeChanged={handleExtraSubtitlesSizeChanged}
                        onExtraSubtitlesTextColorChanged={handleExtraSubtitlesTextColorChanged}
                        onExtraSubtitlesBackgroundColorChanged={handleExtraSubtitlesBackgroundColorChanged}
                        onExtraSubtitlesOutlineColorChanged={handleExtraSubtitlesOutlineColorChanged}
                        onExtraSubtitlesOffsetChanged={handleExtraSubtitlesOffsetChanged}
                        onExtraSubtitlesDelayChanged={handleExtraSubtitlesDelayChanged}
                        onSubtitlesFileUpload={handleSubtitleFileUpload}
                        onPresetSelected={handlePresetSelected}
                        onResetToDefaults={handleResetToDefaults}
                    />
                </div>
            )}
            
            {/* Status Panel */}
            {showStatusPanel && (
                <div className={styles['status-panel']} role="complementary" aria-label={t('STATUS_PANEL')}>
                    <div className={styles['status-header']}>
                        <h3 className={styles['status-title']}>{t('SYSTEM_STATUS')}</h3>
                        <Button
                            className={styles['close-status-button']}
                            onClick={() => setShowStatusPanel(false)}
                            aria-label={t('CLOSE_STATUS_PANEL')}
                        >
                            <Icon name="close" />
                        </Button>
                    </div>
                    
                    <div className={styles['status-content']}>
                        {/* Audio Detection Status */}
                        <div className={styles['status-section']}>
                            <h4 className={styles['status-section-title']}>{t('AUDIO_DETECTION_STATUS')}</h4>
                            <div className={styles['status-item']}>
                                <span className={styles['status-label']}>{t('STATUS')}:</span>
                                <span className={classNames(styles['status-value'], styles[getStatusInfo().audio.status])}>
                                    {t(getStatusInfo().audio.message)}
                                </span>
                            </div>
                            <div className={styles['status-item']}>
                                <span className={styles['status-label']}>{t('TRACKS_DETECTED')}:</span>
                                <span className={styles['status-value']}>
                                    {enhancedPlayer.state.audioTracks.length}
                                </span>
                            </div>
                        </div>
                        
                        {/* Subtitle Processing Status */}
                        <div className={styles['status-section']}>
                            <h4 className={styles['status-section-title']}>{t('SUBTITLE_PROCESSING_STATUS')}</h4>
                            <div className={styles['status-item']}>
                                <span className={styles['status-label']}>{t('STATUS')}:</span>
                                <span className={classNames(styles['status-value'], styles[getStatusInfo().subtitles.status])}>
                                    {t(getStatusInfo().subtitles.message)}
                                </span>
                            </div>
                            <div className={styles['status-item']}>
                                <span className={styles['status-label']}>{t('FILES_PROCESSED')}:</span>
                                <span className={styles['status-value']}>
                                    {enhancedPlayer.state.uploadedSubtitles.length}
                                </span>
                            </div>
                        </div>
                        
                        {/* Performance Metrics */}
                        <div className={styles['status-section']}>
                            <h4 className={styles['status-section-title']}>{t('PERFORMANCE_METRICS')}</h4>
                            <div className={styles['status-item']}>
                                <span className={styles['status-label']}>{t('PROCESSING_TIME')}:</span>
                                <span className={styles['status-value']}>
                                    {getPerformanceMetrics().processingTime.toFixed(2)}ms
                                </span>
                            </div>
                            <div className={styles['status-item']}>
                                <span className={styles['status-label']}>{t('ERROR_COUNT')}:</span>
                                <span className={styles['status-value']}>
                                    {getPerformanceMetrics().errorCount}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Accessibility Features */}
            <div className={styles['accessibility-features']} role="region" aria-label={t('ACCESSIBILITY_FEATURES')}>
                <div className={styles['accessibility-indicators']}>
                    {reducedMotion && (
                        <div className={styles['reduced-motion-indicator']}>
                            <Icon name="accessibility" className={styles['accessibility-icon']} />
                            <span className={styles['accessibility-text']}>{t('REDUCED_MOTION_ACTIVE')}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EnhancedPlayerIntegration;
