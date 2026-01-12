// Copyright (C) 2024 Stremio UI/UX Enhancement
// Advanced Subtitles Menu with Intuitive Styling Interface

import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Button, ColorInput } from 'stremio/components';
import { useColorContrast, useScreenReader } from 'stremio/common/accessibility';
import { 
    SUBTITLE_FONTS, 
    SUBTITLE_PRESETS, 
    SUBTITLE_SIZES, 
    SUBTITLE_COLORS,
    SUBTITLE_OUTLINE_SIZES,
    SUBTITLE_FORMATS 
} from 'stremio/common/ENHANCED_CONSTANTS';
import styles from './AdvancedSubtitlesMenu.less';

type Props = {
    className?: string,
    subtitlesTracks: Array<{
        id: string,
        label: string,
        lang: string,
        origin: string,
        embedded: boolean
    }>,
    selectedSubtitlesTrackId: string | null,
    subtitlesSize: number | null,
    subtitlesTextColor: string | null,
    subtitlesBackgroundColor: string | null,
    subtitlesBackgroundOpacity: number | null,
    subtitlesOutlineColor: string | null,
    subtitlesOutlineSize: number | null,
    subtitlesFont: string | null,
    subtitlesOffset: number | null,
    subtitlesDelay: number | null,
    extraSubtitlesTracks: Array<any>,
    selectedExtraSubtitlesTrackId: string | null,
    extraSubtitlesSize: number | null,
    extraSubtitlesTextColor: string | null,
    extraSubtitlesBackgroundColor: string | null,
    extraSubtitlesOutlineColor: string | null,
    extraSubtitlesOffset: number | null,
    extraSubtitlesDelay: number | null,
    audioTracks: Array<{
        id: string,
        label: string,
        lang: string,
        codec?: string,
        channels?: string,
        bitrate?: number
    }>,
    selectedAudioTrackId: string | null,
    onSubtitlesTrackSelected: (id: string | null) => void,
    onExtraSubtitlesTrackSelected: (id: string | null) => void,
    onAudioTrackSelected: (id: string | null) => void,
    onSubtitlesSizeChanged: (size: number) => void,
    onSubtitlesTextColorChanged: (color: string) => void,
    onSubtitlesBackgroundColorChanged: (color: string) => void,
    onSubtitlesBackgroundOpacityChanged: (opacity: number) => void,
    onSubtitlesOutlineColorChanged: (color: string) => void,
    onSubtitlesOutlineSizeChanged: (size: number) => void,
    onSubtitlesFontChanged: (font: string) => void,
    onSubtitlesOffsetChanged: (offset: number) => void,
    onSubtitlesDelayChanged: (delay: number) => void,
    onExtraSubtitlesSizeChanged: (size: number) => void,
    onExtraSubtitlesTextColorChanged: (color: string) => void,
    onExtraSubtitlesBackgroundColorChanged: (color: string) => void,
    onExtraSubtitlesOutlineColorChanged: (color: string) => void,
    onExtraSubtitlesOffsetChanged: (offset: number) => void,
    onExtraSubtitlesDelayChanged: (delay: number) => void,
    onSubtitlesFileUpload: (file: File) => void,
    onPresetSelected: (preset: string) => void,
    onResetToDefaults: () => void
};

const AdvancedSubtitlesMenu = ({
    className,
    subtitlesTracks,
    selectedSubtitlesTrackId,
    subtitlesSize,
    subtitlesTextColor,
    subtitlesBackgroundColor,
    subtitlesBackgroundOpacity,
    subtitlesOutlineColor,
    subtitlesOutlineSize,
    subtitlesFont,
    subtitlesOffset,
    subtitlesDelay,
    extraSubtitlesTracks,
    selectedExtraSubtitlesTrackId,
    extraSubtitlesSize,
    extraSubtitlesTextColor,
    extraSubtitlesBackgroundColor,
    extraSubtitlesOutlineColor,
    extraSubtitlesOffset,
    extraSubtitlesDelay,
    audioTracks,
    selectedAudioTrackId,
    onSubtitlesTrackSelected,
    onExtraSubtitlesTrackSelected,
    onAudioTrackSelected,
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
    onExtraSubtitlesDelayChanged,
    onSubtitlesFileUpload,
    onPresetSelected,
    onResetToDefaults
}: Props) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('styling');
    const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
    const [uploadingFile, setUploadingFile] = useState(false);
    
    // Determine current track type
    const isEmbeddedSubtitles = selectedSubtitlesTrackId !== null;
    const isExtraSubtitles = selectedExtraSubtitlesTrackId !== null;
    const currentSize = isEmbeddedSubtitles ? subtitlesSize : extraSubtitlesSize;
    const currentTextColor = isEmbeddedSubtitles ? subtitlesTextColor : extraSubtitlesTextColor;
    const currentBackgroundColor = isEmbeddedSubtitles ? subtitlesBackgroundColor : extraSubtitlesBackgroundColor;
    const currentBackgroundOpacity = isEmbeddedSubtitles ? subtitlesBackgroundOpacity : 1;
    const currentOutlineColor = isEmbeddedSubtitles ? subtitlesOutlineColor : extraSubtitlesOutlineColor;
    const currentOutlineSize = isEmbeddedSubtitles ? subtitlesOutlineSize : 1;
    const currentFont = isEmbeddedSubtitles ? subtitlesFont : 'Arial';
    const currentOffset = isEmbeddedSubtitles ? subtitlesOffset : extraSubtitlesOffset;
    const currentDelay = isEmbeddedSubtitles ? subtitlesDelay : extraSubtitlesDelay;
    
    // Color contrast validation
    const textContrast = useColorContrast(currentTextColor || '#FFFFFF', currentBackgroundColor || '#000000');
    const outlineContrast = useColorContrast(currentOutlineColor || '#000000', currentTextColor || '#FFFFFF');
    
    // Announce changes to screen readers
    useScreenReader(
        activeTab === 'styling' ? 'Subtitle styling options' :
        activeTab === 'position' ? 'Subtitle position and timing options' :
        activeTab === 'audio' ? 'Audio track selection' :
        'Subtitle format and upload options',
        'polite',
        300
    );
    
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadingFile(true);
            onSubtitlesFileUpload(file);
            setUploadingFile(false);
        }
    }, [onSubtitlesFileUpload]);
    
    const handlePresetSelect = useCallback((presetKey: string) => {
        onPresetSelected(presetKey);
        useScreenReader(`Applied ${presetKey} preset`, 'polite');
    }, [onPresetSelected]);
    
    const handleReset = useCallback(() => {
        onResetToDefaults();
        useScreenReader('Reset to default settings', 'polite');
    }, [onResetToDefaults]);
    
    const handleColorChange = useCallback((colorType: string, color: string) => {
        switch (colorType) {
            case 'text':
                isEmbeddedSubtitles ? onSubtitlesTextColorChanged(color) : onExtraSubtitlesTextColorChanged(color);
                break;
            case 'background':
                isEmbeddedSubtitles ? onSubtitlesBackgroundColorChanged(color) : onExtraSubtitlesBackgroundColorChanged(color);
                break;
            case 'outline':
                isEmbeddedSubtitles ? onSubtitlesOutlineColorChanged(color) : onExtraSubtitlesOutlineColorChanged(color);
                break;
        }
        setShowColorPicker(null);
    }, [isEmbeddedSubtitles, onSubtitlesTextColorChanged, onExtraSubtitlesTextColorChanged, 
          onSubtitlesBackgroundColorChanged, onExtraSubtitlesBackgroundColorChanged,
          onSubtitlesOutlineColorChanged, onExtraSubtitlesOutlineColorChanged]);
    
    const tabs = useMemo(() => [
        { id: 'styling', label: t('SUBTITLE_STYLING'), icon: 'paint-brush' },
        { id: 'position', label: t('SUBTITLE_POSITION'), icon: 'move' },
        { id: 'audio', label: t('AUDIO_TRACKS'), icon: 'volume-up' },
        { id: 'formats', label: t('SUBTITLE_FORMATS'), icon: 'file-text' }
    ], [t]);
    
    return (
        <div className={classNames(className, styles['advanced-subtitles-menu'])} role="dialog" aria-label={t('ADVANCED_SUBTITLE_SETTINGS')}>
            {/* Header with tabs */}
            <div className={styles['menu-header']}>
                <h2 className={styles['menu-title']}>{t('ADVANCED_SUBTITLE_SETTINGS')}</h2>
                <div className={styles['tab-navigation']} role="tablist">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={classNames(styles['tab-button'], { [styles['active']]: activeTab === tab.id })}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            aria-controls={`${tab.id}-panel`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className={styles['tab-icon']} aria-hidden="true">{tab.icon}</span>
                            <span className={styles['tab-label']}>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Tab content */}
            <div className={styles['tab-content']}>
                {/* Styling Tab */}
                {activeTab === 'styling' && (
                    <div className={styles['tab-panel']} id="styling-panel" role="tabpanel">
                        <div className={styles['preset-section']}>
                            <h3 className={styles['section-title']}>{t('QUICK_PRESETS')}</h3>
                            <div className={styles['preset-grid']}>
                                {Object.entries(SUBTITLE_PRESETS).map(([key, preset]) => (
                                    <button
                                        key={key}
                                        className={styles['preset-button']}
                                        onClick={() => handlePresetSelect(key)}
                                        aria-label={`Apply ${preset.name} preset`}
                                    >
                                        <div className={styles['preset-preview']} style={{
                                            color: preset.textColor,
                                            backgroundColor: preset.backgroundColor,
                                            textShadow: preset.outlineColor ? `1px 1px 2px ${preset.outlineColor}` : 'none'
                                        }}>
                                            Aa
                                        </div>
                                        <span className={styles['preset-name']}>{t(preset.name)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className={styles['styling-controls']}>
                            <div className={styles['control-group']}>
                                <label className={styles['control-label']} htmlFor="font-family">{t('FONT_FAMILY')}</label>
                                <select
                                    id="font-family"
                                    className={styles['font-select']}
                                    value={currentFont || 'Arial'}
                                    onChange={(e) => onSubtitlesFontChanged(e.target.value)}
                                >
                                    {SUBTITLE_FONTS.map((font) => (
                                        <option key={font} value={font}>{font}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className={styles['control-group']}>
                                <label className={styles['control-label']} htmlFor="font-size">{t('FONT_SIZE')}</label>
                                <div className={styles['slider-container']}>
                                    <input
                                        id="font-size"
                                        type="range"
                                        min={SUBTITLE_SIZES[0]}
                                        max={SUBTITLE_SIZES[SUBTITLE_SIZES.length - 1]}
                                        step={25}
                                        value={currentSize || 100}
                                        onChange={(e) => isEmbeddedSubtitles ? onSubtitlesSizeChanged(parseInt(e.target.value)) : onExtraSubtitlesSizeChanged(parseInt(e.target.value))}
                                        className={styles['size-slider']}
                                    />
                                    <span className={styles['slider-value']}>{currentSize || 100}%</span>
                                </div>
                            </div>
                            
                            <div className={styles['color-controls']}>
                                <div className={styles['control-group']}>
                                    <label className={styles['control-label']}>{t('TEXT_COLOR')}</label>
                                    <div className={styles['color-input-group']}>
                                        <ColorInput
                                            value={currentTextColor || '#FFFFFF'}
                                            onChange={(color) => handleColorChange('text', color)}
                                        />
                                        {!textContrast.meetsWCAG && (
                                            <div className={styles['contrast-warning']} role="alert">
                                                ⚠️ {t('LOW_CONTRAST_WARNING')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className={styles['control-group']}>
                                    <label className={styles['control-label']}>{t('BACKGROUND_COLOR')}</label>
                                    <ColorInput
                                        value={currentBackgroundColor || '#000000'}
                                        onChange={(color) => handleColorChange('background', color)}
                                    />
                                </div>
                                
                                <div className={styles['control-group']}>
                                    <label className={styles['control-label']} htmlFor="background-opacity">{t('BACKGROUND_OPACITY')}</label>
                                    <div className={styles['slider-container']}>
                                        <input
                                            id="background-opacity"
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={5}
                                            value={(currentBackgroundOpacity || 1) * 100}
                                            onChange={(e) => onSubtitlesBackgroundOpacityChanged(parseInt(e.target.value) / 100)}
                                            className={styles['opacity-slider']}
                                        />
                                        <span className={styles['slider-value']}>{Math.round((currentBackgroundOpacity || 1) * 100)}%</span>
                                    </div>
                                </div>
                                
                                <div className={styles['control-group']}>
                                    <label className={styles['control-label']}>{t('OUTLINE_COLOR')}</label>
                                    <ColorInput
                                        value={currentOutlineColor || '#000000'}
                                        onChange={(color) => handleColorChange('outline', color)}
                                    />
                                </div>
                                
                                <div className={styles['control-group']}>
                                    <label className={styles['control-label']} htmlFor="outline-size">{t('OUTLINE_SIZE')}</label>
                                    <div className={styles['slider-container']}>
                                        <input
                                            id="outline-size"
                                            type="range"
                                            min={SUBTITLE_OUTLINE_SIZES[0]}
                                            max={SUBTITLE_OUTLINE_SIZES[SUBTITLE_OUTLINE_SIZES.length - 1]}
                                            step={1}
                                            value={currentOutlineSize || 1}
                                            onChange={(e) => isEmbeddedSubtitles ? onSubtitlesOutlineSizeChanged(parseInt(e.target.value)) : null}
                                            className={styles['outline-slider']}
                                        />
                                        <span className={styles['slider-value']}>{currentOutlineSize || 1}px</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className={styles['preview-section']}>
                            <h3 className={styles['section-title']}>{t('PREVIEW')}</h3>
                            <div 
                                className={styles['subtitle-preview']}
                                style={{
                                    fontFamily: currentFont,
                                    fontSize: `${currentSize || 100}%`,
                                    color: currentTextColor,
                                    backgroundColor: currentBackgroundColor,
                                    opacity: currentBackgroundOpacity,
                                    textShadow: currentOutlineColor ? `${currentOutlineSize}px ${currentOutlineSize}px ${currentOutlineSize}px ${currentOutlineColor}` : 'none'
                                }}
                            >
                                {t('SUBTITLE_PREVIEW_TEXT')}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Position Tab */}
                {activeTab === 'position' && (
                    <div className={styles['tab-panel']} id="position-panel" role="tabpanel">
                        <div className={styles['position-controls']}>
                            <div className={styles['control-group']}>
                                <label className={styles['control-label']} htmlFor="vertical-position">{t('VERTICAL_POSITION')}</label>
                                <div className={styles['slider-container']}>
                                    <input
                                        id="vertical-position"
                                        type="range"
                                        min={0}
                                        max={100}
                                        step={1}
                                        value={currentOffset || 50}
                                        onChange={(e) => isEmbeddedSubtitles ? onSubtitlesOffsetChanged(parseInt(e.target.value)) : onExtraSubtitlesOffsetChanged(parseInt(e.target.value))}
                                        className={styles['position-slider']}
                                    />
                                    <span className={styles['slider-value']}>{currentOffset || 50}%</span>
                                </div>
                            </div>
                            
                            <div className={styles['control-group']}>
                                <label className={styles['control-label']} htmlFor="subtitle-delay">{t('SUBTITLE_DELAY')}</label>
                                <div className={styles['slider-container']}>
                                    <input
                                        id="subtitle-delay"
                                        type="range"
                                        min={-10}
                                        max={10}
                                        step={0.1}
                                        value={(currentDelay || 0) / 1000}
                                        onChange={(e) => isEmbeddedSubtitles ? onSubtitlesDelayChanged(parseFloat(e.target.value) * 1000) : onExtraSubtitlesDelayChanged(parseFloat(e.target.value) * 1000)}
                                        className={styles['delay-slider']}
                                    />
                                    <span className={styles['slider-value']}>{((currentDelay || 0) / 1000).toFixed(1)}s</span>
                                </div>
                            </div>
                            
                            <div className={styles['alignment-controls']}>
                                <label className={styles['control-label']}>{t('TEXT_ALIGNMENT')}</label>
                                <div className={styles['alignment-buttons']} role="group" aria-label={t('TEXT_ALIGNMENT')}>
                                    <button className={styles['alignment-button']} aria-label={t('ALIGN_LEFT')}>⬅</button>
                                    <button className={styles['alignment-button']} aria-label={t('ALIGN_CENTER')}>⬌</button>
                                    <button className={styles['alignment-button']} aria-label={t('ALIGN_RIGHT')}>➡</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Audio Tab */}
                {activeTab === 'audio' && (
                    <div className={styles['tab-panel']} id="audio-panel" role="tabpanel">
                        <div className={styles['audio-controls']}>
                            <div className={styles['control-group']}>
                                <label className={styles['control-label']}>{t('AUDIO_TRACKS')}</label>
                                <div className={styles['audio-track-list']}>
                                    {audioTracks.map((track) => (
                                        <button
                                            key={track.id}
                                            className={classNames(styles['audio-track-button'], {
                                                [styles['selected']]: selectedAudioTrackId === track.id
                                            })}
                                            onClick={() => onAudioTrackSelected(track.id)}
                                            aria-pressed={selectedAudioTrackId === track.id}
                                        >
                                            <div className={styles['track-info']}>
                                                <div className={styles['track-label']}>{track.label}</div>
                                                <div className={styles['track-details']}>
                                                    {track.lang} • {track.codec} • {track.channels}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Formats Tab */}
                {activeTab === 'formats' && (
                    <div className={styles['tab-panel']} id="formats-panel" role="tabpanel">
                        <div className={styles['format-controls']}>
                            <div className={styles['upload-section']}>
                                <h3 className={styles['section-title']}>{t('UPLOAD_SUBTITLES')}</h3>
                                <p className={styles['upload-description']}>{t('SUPPORTED_FORMATS')}: SRT, VTT, ASS, SUB</p>
                                <div className={styles['upload-area']}>
                                    <input
                                        type="file"
                                        accept=".srt,.vtt,.ass,.ssa,.sub"
                                        onChange={handleFileUpload}
                                        className={styles['file-input']}
                                        id="subtitle-file-input"
                                        aria-label={t('CHOOSE_SUBTITLE_FILE')}
                                    />
                                    <label htmlFor="subtitle-file-input" className={styles['upload-label']}>
                                        {uploadingFile ? t('UPLOADING') : t('CHOOSE_FILE')}
                                    </label>
                                </div>
                            </div>
                            
                            <div className={styles['format-info']}>
                                <h3 className={styles['section-title']}>{t('FORMAT_INFORMATION')}</h3>
                                <div className={styles['format-grid']}>
                                    {SUBTITLE_FORMATS.map((format) => (
                                        <div key={format.extension} className={styles['format-card']}>
                                            <div className={styles['format-header']}>
                                                <span className={styles['format-extension']}>{format.extension}</span>
                                                <span className={styles['format-name']}>{format.name}</span>
                                            </div>
                                            <div className={styles['format-features']}>
                                                {format.features.map((feature, index) => (
                                                    <span key={index} className={styles['feature-tag']}>
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer with action buttons */}
            <div className={styles['menu-footer']}>
                <Button className={styles['reset-button']} onClick={handleReset}>
                    {t('RESET_TO_DEFAULTS')}
                </Button>
                <div className={styles['footer-info']}>
                    <span className={styles['help-text']}>{t('SETTINGS_APPLIED_AUTOMATICALLY')}</span>
                </div>
            </div>
        </div>
    );
};

export default AdvancedSubtitlesMenu;