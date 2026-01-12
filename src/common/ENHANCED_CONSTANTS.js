// Copyright (C) 2024 Stremio UI/UX Enhancement
// Enhanced Constants for Advanced Subtitle and Audio Features

// Subtitle Styling Constants
export const SUBTITLE_FONTS = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Tahoma',
    'Trebuchet MS',
    'Impact',
    'Comic Sans MS',
    'Courier New',
    'Lucida Console',
    'Monaco',
    'Roboto',
    'Open Sans',
    'Lato',
    'Noto Sans',
    'Source Sans Pro',
    'Ubuntu',
    'Droid Sans',
    'PT Sans'
];

export const SUBTITLE_SIZES = [50, 75, 100, 125, 150, 175, 200];

export const SUBTITLE_COLORS = [
    '#FFFFFF', // White
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#FFC0CB', // Pink
    '#A52A2A', // Brown
    '#808080', // Gray
    '#C0C0C0', // Silver
    '#FFD700', // Gold
    '#4B0082'  // Indigo
];

export const SUBTITLE_OUTLINE_SIZES = [0, 1, 2, 3, 4, 5];

export const SUBTITLE_PRESETS = {
    default: {
        name: 'Default',
        textColor: '#FFFFFF',
        backgroundColor: '#000000',
        backgroundOpacity: 0.8,
        outlineColor: '#000000',
        outlineSize: 1,
        font: 'Arial',
        size: 100
    },
    largePrint: {
        name: 'Large Print',
        textColor: '#FFFFFF',
        backgroundColor: '#000000',
        backgroundOpacity: 0.9,
        outlineColor: '#000000',
        outlineSize: 2,
        font: 'Arial',
        size: 150
    },
    highContrast: {
        name: 'High Contrast',
        textColor: '#FFFF00',
        backgroundColor: '#000000',
        backgroundOpacity: 1.0,
        outlineColor: '#000000',
        outlineSize: 3,
        font: 'Arial',
        size: 125
    },
    minimal: {
        name: 'Minimal',
        textColor: '#FFFFFF',
        backgroundColor: 'transparent',
        backgroundOpacity: 0,
        outlineColor: '#000000',
        outlineSize: 1,
        font: 'Arial',
        size: 100
    },
    cinema: {
        name: 'Cinema',
        textColor: '#FFFFFF',
        backgroundColor: '#1a1a1a',
        backgroundOpacity: 0.7,
        outlineColor: '#000000',
        outlineSize: 1,
        font: 'Helvetica',
        size: 100
    },
    accessibility: {
        name: 'Accessibility',
        textColor: '#FFFFFF',
        backgroundColor: '#000080',
        backgroundOpacity: 0.9,
        outlineColor: '#FFFF00',
        outlineSize: 2,
        font: 'Arial',
        size: 125
    }
};

// Audio Track Detection Settings
export const AUDIO_DETECTION_SETTINGS = {
    confidenceThreshold: 0.7,
    qualityThreshold: 0.6,
    languageConfidence: 0.8,
    maxRetries: 3,
    timeout: 5000,
    fallbackDelay: 1000
};

// Audio Codec Support
export const AUDIO_CODECS = {
    AAC: {
        name: 'AAC',
        fullName: 'Advanced Audio Coding',
        channels: ['Stereo', '5.1', '7.1'],
        bitrates: [128, 192, 256, 320, 384, 448, 512],
        extensions: ['.aac', '.m4a', '.mp4']
    },
    MP3: {
        name: 'MP3',
        fullName: 'MPEG Audio Layer III',
        channels: ['Stereo', 'Joint Stereo'],
        bitrates: [128, 160, 192, 224, 256, 320],
        extensions: ['.mp3']
    },
    AC3: {
        name: 'AC-3',
        fullName: 'Dolby Digital',
        channels: ['Stereo', '5.1'],
        bitrates: [192, 224, 256, 320, 384, 448, 640],
        extensions: ['.ac3']
    },
    EAC3: {
        name: 'E-AC-3',
        fullName: 'Dolby Digital Plus',
        channels: ['Stereo', '5.1', '7.1'],
        bitrates: [192, 256, 320, 384, 448, 512, 640, 768, 1024],
        extensions: ['.eac3', '.ec3']
    },
    DTS: {
        name: 'DTS',
        fullName: 'Digital Theater Systems',
        channels: ['Stereo', '5.1', '7.1'],
        bitrates: [384, 448, 512, 640, 768, 960, 1152, 1344, 1509],
        extensions: ['.dts']
    },
    FLAC: {
        name: 'FLAC',
        fullName: 'Free Lossless Audio Codec',
        channels: ['Stereo', '5.1', '7.1'],
        bitrates: [700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500],
        extensions: ['.flac']
    },
    OPUS: {
        name: 'Opus',
        fullName: 'Opus Audio Codec',
        channels: ['Stereo', '5.1'],
        bitrates: [64, 96, 128, 160, 192, 224, 256, 320, 384],
        extensions: ['.opus']
    },
    VORBIS: {
        name: 'Vorbis',
        fullName: 'Ogg Vorbis',
        channels: ['Stereo', '5.1'],
        bitrates: [128, 160, 192, 224, 256, 320, 384, 448, 512],
        extensions: ['.ogg', '.oga']
    }
};

// Video Format Support
export const VIDEO_FORMATS = {
    MP4: {
        name: 'MP4',
        fullName: 'MPEG-4 Part 14',
        codecs: ['H.264', 'H.265', 'VP9', 'AV1'],
        audioCodecs: ['AAC', 'MP3', 'AC-3', 'E-AC-3'],
        extensions: ['.mp4', '.m4v'],
        mimeType: 'video/mp4'
    },
    MKV: {
        name: 'MKV',
        fullName: 'Matroska Video',
        codecs: ['H.264', 'H.265', 'VP9', 'AV1', 'MPEG-4'],
        audioCodecs: ['AAC', 'MP3', 'AC-3', 'E-AC-3', 'DTS', 'FLAC', 'Opus', 'Vorbis'],
        extensions: ['.mkv', '.mka'],
        mimeType: 'video/x-matroska'
    },
    WEBM: {
        name: 'WebM',
        fullName: 'Web Media',
        codecs: ['VP8', 'VP9', 'AV1'],
        audioCodecs: ['Opus', 'Vorbis'],
        extensions: ['.webm'],
        mimeType: 'video/webm'
    },
    AVI: {
        name: 'AVI',
        fullName: 'Audio Video Interleave',
        codecs: ['H.264', 'MPEG-4', 'DivX', 'XviD'],
        audioCodecs: ['MP3', 'AC-3'],
        extensions: ['.avi'],
        mimeType: 'video/x-msvideo'
    },
    MOV: {
        name: 'MOV',
        fullName: 'QuickTime Movie',
        codecs: ['H.264', 'H.265', 'MPEG-4'],
        audioCodecs: ['AAC', 'MP3'],
        extensions: ['.mov', '.qt'],
        mimeType: 'video/quicktime'
    }
};

// Subtitle Format Support
export const SUBTITLE_FORMATS = [
    {
        extension: '.srt',
        name: 'SubRip',
        features: ['Basic timing', 'Text only', 'Universal support'],
        description: 'Most common subtitle format'
    },
    {
        extension: '.vtt',
        name: 'WebVTT',
        features: ['HTML styling', 'Cues and regions', 'Modern web support'],
        description: 'Web standard for subtitles'
    },
    {
        extension: '.ass',
        name: 'Advanced SubStation',
        features: ['Advanced styling', 'Animations', 'Positioning'],
        description: 'Professional subtitle format'
    },
    {
        extension: '.ssa',
        name: 'SubStation Alpha',
        features: ['Basic styling', 'Simple animations', 'Legacy support'],
        description: 'Predecessor to ASS format'
    },
    {
        extension: '.sub',
        name: 'MicroDVD',
        features: ['Frame-based timing', 'Basic formatting', 'Legacy support'],
        description: 'Frame-based subtitle format'
    }
];

// Accessibility Features
export const ACCESSIBILITY_FEATURES = {
    wcagCompliance: {
        level: 'AA',
        contrastRatio: 4.5,
        largeTextContrastRatio: 3.0
    },
    screenReader: {
        announcements: true,
        liveRegions: true,
        ariaLabels: true
    },
    keyboardNavigation: {
        tabOrder: 'logical',
        focusIndicators: true,
        shortcuts: true
    },
    highContrast: {
        supported: true,
        themes: ['dark', 'light', 'high-contrast'],
        colorBlindSupport: true
    },
    reducedMotion: {
        supported: true,
        respectPrefers: true,
        alternativeAnimations: true
    }
};

// Performance Settings
export const PERFORMANCE_SETTINGS = {
    subtitleRendering: {
        maxConcurrent: 10,
        cacheSize: 100,
        renderAhead: 2,
        cleanupInterval: 5000
    },
    audioDetection: {
        batchSize: 5,
        processingDelay: 100,
        maxProcessingTime: 30000,
        memoryLimit: '256MB'
    },
    formatConversion: {
        chunkSize: 1024 * 1024, // 1MB
        maxFileSize: 50 * 1024 * 1024, // 50MB
        timeout: 30000,
        supportedEncodings: ['UTF-8', 'UTF-16', 'ISO-8859-1', 'Windows-1252']
    }
};

// Error Messages and Status Codes
export const ERROR_MESSAGES = {
    audioDetection: {
        NO_AUDIO_TRACKS: 'No audio tracks detected',
        UNSUPPORTED_CODEC: 'Audio codec not supported',
        DETECTION_FAILED: 'Audio track detection failed',
        TIMEOUT: 'Audio detection timeout',
        NETWORK_ERROR: 'Network error during audio detection'
    },
    subtitleProcessing: {
        INVALID_FORMAT: 'Invalid subtitle format',
        TIMING_ERROR: 'Subtitle timing error',
        ENCODING_ERROR: 'Subtitle encoding error',
        FILE_TOO_LARGE: 'Subtitle file too large',
        CONVERSION_FAILED: 'Subtitle conversion failed'
    },
    fileUpload: {
        INVALID_FILE: 'Invalid file format',
        UPLOAD_FAILED: 'File upload failed',
        NETWORK_ERROR: 'Network error during upload',
        CANCELLED: 'Upload cancelled by user'
    }
};

// Status Indicators
export const STATUS_INDICATORS = {
    audioDetection: {
        IDLE: { status: 'idle', message: 'Ready to detect audio tracks' },
        DETECTING: { status: 'detecting', message: 'Detecting audio tracks...' },
        SUCCESS: { status: 'success', message: 'Audio tracks detected successfully' },
        PARTIAL: { status: 'partial', message: 'Some audio tracks detected' },
        FAILED: { status: 'failed', message: 'Audio detection failed' },
        TIMEOUT: { status: 'timeout', message: 'Audio detection timeout' }
    },
    subtitleProcessing: {
        IDLE: { status: 'idle', message: 'Ready to process subtitles' },
        PARSING: { status: 'parsing', message: 'Parsing subtitle file...' },
        CONVERTING: { status: 'converting', message: 'Converting subtitle format...' },
        VALIDATING: { status: 'validating', message: 'Validating subtitle timing...' },
        SUCCESS: { status: 'success', message: 'Subtitles processed successfully' },
        ERROR: { status: 'error', message: 'Subtitle processing failed' }
    }
};

// Default Export
export default {
    SUBTITLE_FONTS,
    SUBTITLE_SIZES,
    SUBTITLE_COLORS,
    SUBTITLE_OUTLINE_SIZES,
    SUBTITLE_PRESETS,
    AUDIO_DETECTION_SETTINGS,
    AUDIO_CODECS,
    VIDEO_FORMATS,
    SUBTITLE_FORMATS,
    ACCESSIBILITY_FEATURES,
    PERFORMANCE_SETTINGS,
    ERROR_MESSAGES,
    STATUS_INDICATORS
};