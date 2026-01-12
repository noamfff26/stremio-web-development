// Copyright (C) 2024 Stremio UI/UX Enhancement
// Advanced Subtitle Manager with Multi-Format Support and Enhanced Styling

const EventEmitter = require('eventemitter3');
const { SUBTITLE_FORMATS, PERFORMANCE_SETTINGS, ERROR_MESSAGES, STATUS_INDICATORS } = require('stremio/common/ENHANCED_CONSTANTS');

class SubtitleManager extends EventEmitter {
    constructor() {
        super();
        this.subtitleCache = new Map();
        this.formatDetectors = new Map();
        this.parsers = new Map();
        this.converters = new Map();
        this.processingQueue = [];
        this.isProcessing = false;
        this.processingStatus = STATUS_INDICATORS.subtitleProcessing.IDLE;
        
        this.initializeFormatSupport();
    }

    /**
     * Initialize subtitle format support
     */
    initializeFormatSupport() {
        // Register format detectors
        this.formatDetectors.set('srt', this.detectSRTFormat.bind(this));
        this.formatDetectors.set('vtt', this.detectVTTFormat.bind(this));
        this.formatDetectors.set('ass', this.detectASSFormat.bind(this));
        this.formatDetectors.set('ssa', this.detectASSFormat.bind(this));
        this.formatDetectors.set('sub', this.detectSUBFormat.bind(this));

        // Register parsers
        this.parsers.set('srt', this.parseSRT.bind(this));
        this.parsers.set('vtt', this.parseVTT.bind(this));
        this.parsers.set('ass', this.parseASS.bind(this));
        this.parsers.set('ssa', this.parseASS.bind(this));
        this.parsers.set('sub', this.parseSUB.bind(this));

        // Register converters
        this.converters.set('srt-vtt', this.convertSRTtoVTT.bind(this));
        this.converters.set('vtt-srt', this.convertVTTtoSRT.bind(this));
        this.converters.set('ass-srt', this.convertASStoSRT.bind(this));
        this.converters.set('srt-ass', this.convertSRTtoASS.bind(this));
    }

    /**
     * Process subtitle file with automatic format detection
     * @param {File} file - Subtitle file
     * @returns {Promise<Object>} Processing result
     */
    async processSubtitleFile(file) {
        this.updateStatus(STATUS_INDICATORS.subtitleProcessing.PARSING);
        
        try {
            // Validate file
            if (!this.validateSubtitleFile(file)) {
                throw new Error(ERROR_MESSAGES.subtitleProcessing.INVALID_FORMAT);
            }

            // Read file content
            const content = await this.readFileContent(file);
            
            // Detect format
            const format = await this.detectSubtitleFormat(content);
            
            if (!format) {
                throw new Error('Unable to detect subtitle format');
            }

            // Parse subtitles
            const subtitles = await this.parseSubtitles(content, format);
            
            // Validate timing
            const validationResult = this.validateSubtitleTiming(subtitles);
            if (!validationResult.valid) {
                console.warn('Subtitle timing validation failed:', validationResult.errors);
            }

            // Apply enhanced styling
            const styledSubtitles = this.applyEnhancedStyling(subtitles);

            this.updateStatus(STATUS_INDICATORS.subtitleProcessing.SUCCESS);
            
            return {
                success: true,
                format: format,
                subtitles: styledSubtitles,
                metadata: {
                    fileName: file.name,
                    fileSize: file.size,
                    format: format,
                    cueCount: subtitles.length,
                    duration: this.calculateDuration(subtitles),
                    validation: validationResult
                }
            };

        } catch (error) {
            this.updateStatus(STATUS_INDICATORS.subtitleProcessing.ERROR);
            this.emit('error', {
                type: 'SUBTITLE_PROCESSING_ERROR',
                message: error.message,
                fileName: file.name
            });
            
            return {
                success: false,
                error: error.message,
                fileName: file.name
            };
        }
    }

    /**
     * Validate subtitle file
     * @param {File} file - File to validate
     * @returns {boolean} Validation result
     */
    validateSubtitleFile(file) {
        // Check file size
        if (file.size > PERFORMANCE_SETTINGS.formatConversion.maxFileSize) {
            return false;
        }

        // Check file extension
        const validExtensions = ['.srt', '.vtt', '.ass', '.ssa', '.sub'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
        
        return validExtensions.includes(fileExtension);
    }

    /**
     * Read file content
     * @param {File} file - File to read
     * @returns {Promise<string>} File content
     */
    async readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const content = event.target.result;
                    
                    // Handle different encodings
                    const encoding = this.detectEncoding(content);
                    const decodedContent = this.decodeContent(content, encoding);
                    
                    resolve(decodedContent);
                } catch (error) {
                    reject(new Error(ERROR_MESSAGES.subtitleProcessing.ENCODING_ERROR));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file, 'UTF-8');
        });
    }

    /**
     * Detect file encoding
     * @param {string} content - File content
     * @returns {string} Detected encoding
     */
    detectEncoding(content) {
        // Simple encoding detection
        const encodings = PERFORMANCE_SETTINGS.formatConversion.supportedEncodings;
        
        for (const encoding of encodings) {
            try {
                // Test if content can be decoded with this encoding
                new TextDecoder(encoding).decode(new TextEncoder().encode(content));
                return encoding;
            } catch (error) {
                continue;
            }
        }
        
        return 'UTF-8'; // Default fallback
    }

    /**
     * Decode content with specified encoding
     * @param {string} content - Content to decode
     * @param {string} encoding - Encoding to use
     * @returns {string} Decoded content
     */
    decodeContent(content, encoding) {
        try {
            const decoder = new TextDecoder(encoding, { fatal: true });
            return decoder.decode(new TextEncoder().encode(content));
        } catch (error) {
            return content; // Return original if decoding fails
        }
    }

    /**
     * Detect subtitle format from content
     * @param {string} content - Subtitle content
     * @returns {Promise<string>} Detected format
     */
    async detectSubtitleFormat(content) {
        for (const [format, detector] of this.formatDetectors) {
            try {
                if (detector(content)) {
                    return format;
                }
            } catch (error) {
                console.warn(`Format detection failed for ${format}:`, error);
            }
        }
        
        return null;
    }

    /**
     * Detect SRT format
     * @param {string} content - Content to analyze
     * @returns {boolean} Detection result
     */
    detectSRTFormat(content) {
        // SRT format: number\ntime --> time\ntext\n\n
        const srtPattern = /^\d+\s*\n\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/m;
        return srtPattern.test(content);
    }

    /**
     * Detect VTT format
     * @param {string} content - Content to analyze
     * @returns {boolean} Detection result
     */
    detectVTTFormat(content) {
        // VTT format starts with WEBVTT
        return content.trim().startsWith('WEBVTT');
    }

    /**
     * Detect ASS/SSA format
     * @param {string} content - Content to analyze
     * @returns {boolean} Detection result
     */
    detectASSFormat(content) {
        // ASS/SSA format has [Script Info] section
        return /\[Script Info\]/i.test(content) || /\[V4\+ Styles\]/i.test(content);
    }

    /**
     * Detect SUB format (MicroDVD)
     * @param {string} content - Content to analyze
     * @returns {boolean} Detection result
     */
    detectSUBFormat(content) {
        // SUB format: {frame}{frame}text
        const subPattern = /^\{\d+\}\{\d+\}/m;
        return subPattern.test(content);
    }

    /**
     * Parse subtitles based on format
     * @param {string} content - Subtitle content
     * @param {string} format - Subtitle format
     * @returns {Promise<Array>} Parsed subtitles
     */
    async parseSubtitles(content, format) {
        const parser = this.parsers.get(format);
        if (!parser) {
            throw new Error(`No parser available for format: ${format}`);
        }

        return parser(content);
    }

    /**
     * Parse SRT subtitles
     * @param {string} content - SRT content
     * @returns {Array} Parsed subtitles
     */
    parseSRT(content) {
        const subtitles = [];
        const blocks = content.trim().split(/\n\s*\n/);

        for (const block of blocks) {
            const lines = block.trim().split('\n');
            if (lines.length >= 3) {
                const index = parseInt(lines[0]);
                const timingLine = lines[1];
                const textLines = lines.slice(2);

                // Parse timing
                const timingMatch = timingLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
                if (timingMatch) {
                    const startTime = this.parseSRTTime(timingMatch[1]);
                    const endTime = this.parseSRTTime(timingMatch[2]);

                    subtitles.push({
                        id: index,
                        start: startTime,
                        end: endTime,
                        text: textLines.join('\n'),
                        format: 'srt',
                        originalFormat: 'srt'
                    });
                }
            }
        }

        return subtitles;
    }

    /**
     * Parse VTT subtitles
     * @param {string} content - VTT content
     * @returns {Array} Parsed subtitles
     */
    parseVTT(content) {
        const subtitles = [];
        const lines = content.trim().split('\n');
        
        // Skip WEBVTT header
        let i = 0;
        if (lines[0].startsWith('WEBVTT')) {
            i = 1;
        }

        while (i < lines.length) {
            const line = lines[i].trim();
            
            // Skip empty lines and cue identifiers
            if (!line || line.includes('-->')) {
                if (line.includes('-->')) {
                    // Parse timing
                    const timingMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/);
                    if (timingMatch) {
                        const startTime = this.parseVTTTime(timingMatch[1]);
                        const endTime = this.parseVTTTime(timingMatch[2]);
                        
                        // Collect text lines
                        const textLines = [];
                        i++;
                        while (i < lines.length && lines[i].trim() && !lines[i].includes('-->')) {
                            textLines.push(lines[i].trim());
                            i++;
                        }

                        if (textLines.length > 0) {
                            subtitles.push({
                                start: startTime,
                                end: endTime,
                                text: textLines.join('\n'),
                                format: 'vtt',
                                originalFormat: 'vtt',
                                styling: this.parseVTTStyling(textLines)
                            });
                        }
                        continue;
                    }
                }
            }
            i++;
        }

        return subtitles;
    }

    /**
     * Parse ASS/SSA subtitles
     * @param {string} content - ASS/SSA content
     * @returns {Array} Parsed subtitles
     */
    parseASS(content) {
        const subtitles = [];
        const lines = content.split('\n');
        
        let inEventsSection = false;
        let formatLine = null;

        for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine === '[Events]') {
                inEventsSection = true;
                continue;
            }
            
            if (inEventsSection) {
                if (trimmedLine.startsWith('Format:')) {
                    formatLine = trimmedLine;
                    continue;
                }
                
                if (trimmedLine.startsWith('Dialogue:')) {
                    const dialogue = this.parseASSDialogue(trimmedLine, formatLine);
                    if (dialogue) {
                        subtitles.push({
                            start: dialogue.start,
                            end: dialogue.end,
                            text: dialogue.text,
                            format: 'ass',
                            originalFormat: 'ass',
                            styling: dialogue.styling,
                            actor: dialogue.actor,
                            effect: dialogue.effect
                        });
                    }
                }
            }
        }

        return subtitles;
    }

    /**
     * Parse MicroDVD subtitles
     * @param {string} content - SUB content
     * @returns {Array} Parsed subtitles
     */
    parseSUB(content) {
        const subtitles = [];
        const lines = content.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                const match = trimmedLine.match(/^\{(\d+)\}\{(\d+)\}\s*(.*)$/);
                if (match) {
                    const startFrame = parseInt(match[1]);
                    const endFrame = parseInt(match[2]);
                    const text = match[3];

                    // Convert frames to time (assuming 23.976 fps)
                    const fps = 23.976;
                    const startTime = startFrame / fps;
                    const endTime = endFrame / fps;

                    subtitles.push({
                        start: startTime,
                        end: endTime,
                        text: text,
                        format: 'sub',
                        originalFormat: 'sub',
                        startFrame: startFrame,
                        endFrame: endFrame
                    });
                }
            }
        }

        return subtitles;
    }

    /**
     * Parse SRT time format
     * @param {string} timeStr - Time string (HH:MM:SS,mmm)
     * @returns {number} Time in seconds
     */
    parseSRTTime(timeStr) {
        const parts = timeStr.split(':');
        const secondsParts = parts[2].split(',');
        
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        const seconds = parseInt(secondsParts[0]);
        const milliseconds = parseInt(secondsParts[1]);
        
        return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
    }

    /**
     * Parse VTT time format
     * @param {string} timeStr - Time string (HH:MM:SS.mmm)
     * @returns {number} Time in seconds
     */
    parseVTTTime(timeStr) {
        const parts = timeStr.split(':');
        const secondsParts = parts[2].split('.');
        
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        const seconds = parseInt(secondsParts[0]);
        const milliseconds = parseInt(secondsParts[1]);
        
        return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
    }

    /**
     * Parse ASS dialogue line
     * @param {string} line - Dialogue line
     * @param {string} formatLine - Format line
     * @returns {Object} Parsed dialogue
     */
    parseASSDialogue(line, formatLine) {
        const dialogueMatch = line.match(/^Dialogue:\s*(.*)$/);
        if (!dialogueMatch) return null;

        const parts = dialogueMatch[1].split(',');
        
        // Basic ASS parsing (simplified)
        const startTime = this.parseASSTime(parts[1]);
        const endTime = this.parseASSTime(parts[2]);
        const actor = parts[4] || '';
        const effect = parts[5] || '';
        const text = parts.slice(9).join(',').replace(/\{[^}]*\}/g, ''); // Remove styling tags

        return {
            start: startTime,
            end: endTime,
            text: text,
            actor: actor,
            effect: effect,
            styling: this.parseASSStyling(line)
        };
    }

    /**
     * Parse ASS time format
     * @param {string} timeStr - Time string (H:MM:SS.cc)
     * @returns {number} Time in seconds
     */
    parseASSTime(timeStr) {
        const parts = timeStr.split(':');
        const secondsParts = parts[2].split('.');
        
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        const seconds = parseInt(secondsParts[0]);
        const centiseconds = parseInt(secondsParts[1]);
        
        return hours * 3600 + minutes * 60 + seconds + centiseconds / 100;
    }

    /**
     * Parse VTT styling information
     * @param {Array} textLines - Text lines
     * @returns {Object} Styling information
     */
    parseVTTStyling(textLines) {
        const styling = {};
        
        // Basic VTT styling parsing
        for (const line of textLines) {
            if (line.includes('<')) {
                styling.hasHTML = true;
            }
            if (line.includes('::cue')) {
                styling.hasCSS = true;
            }
        }
        
        return styling;
    }

    /**
     * Parse ASS styling information
     * @param {string} line - ASS line
     * @returns {Object} Styling information
     */
    parseASSStyling(line) {
        const styling = {};
        
        // Extract styling tags
        const styleMatches = line.match(/\{([^}]+)\}/g);
        if (styleMatches) {
            styling.tags = styleMatches;
            styling.hasStyling = true;
        }
        
        return styling;
    }

    /**
     * Validate subtitle timing
     * @param {Array} subtitles - Subtitle array
     * @returns {Object} Validation result
     */
    validateSubtitleTiming(subtitles) {
        const errors = [];
        const warnings = [];
        
        for (let i = 0; i < subtitles.length; i++) {
            const subtitle = subtitles[i];
            
            // Check for negative timing
            if (subtitle.start < 0 || subtitle.end < 0) {
                errors.push(`Negative timing in subtitle ${i + 1}`);
            }
            
            // Check for invalid timing (end before start)
            if (subtitle.end <= subtitle.start) {
                errors.push(`Invalid timing in subtitle ${i + 1}: end before start`);
            }
            
            // Check for overlapping subtitles
            if (i > 0) {
                const prevSubtitle = subtitles[i - 1];
                if (subtitle.start < prevSubtitle.end) {
                    warnings.push(`Overlapping subtitles at index ${i}`);
                }
            }
            
            // Check for very short duration
            const duration = subtitle.end - subtitle.start;
            if (duration < 0.5) {
                warnings.push(`Very short duration in subtitle ${i + 1}: ${duration}s`);
            }
            
            // Check for very long duration
            if (duration > 10) {
                warnings.push(`Very long duration in subtitle ${i + 1}: ${duration}s`);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    /**
     * Apply enhanced styling to subtitles
     * @param {Array} subtitles - Subtitle array
     * @returns {Array} Styled subtitles
     */
    applyEnhancedStyling(subtitles) {
        return subtitles.map(subtitle => ({
            ...subtitle,
            enhanced: true,
            styling: {
                ...subtitle.styling,
                enhanced: true,
                timestamp: Date.now()
            }
        }));
    }

    /**
     * Calculate subtitle duration
     * @param {Array} subtitles - Subtitle array
     * @returns {number} Duration in seconds
     */
    calculateDuration(subtitles) {
        if (subtitles.length === 0) return 0;
        
        const startTimes = subtitles.map(s => s.start).filter(s => !isNaN(s));
        const endTimes = subtitles.map(s => s.end).filter(s => !isNaN(s));
        
        if (startTimes.length === 0 || endTimes.length === 0) return 0;
        
        return Math.max(...endTimes) - Math.min(...startTimes);
    }

    /**
     * Convert between subtitle formats
     * @param {Array} subtitles - Subtitle array
     * @param {string} targetFormat - Target format
     * @returns {Promise<Array>} Converted subtitles
     */
    async convertSubtitles(subtitles, targetFormat) {
        this.updateStatus(STATUS_INDICATORS.subtitleProcessing.CONVERTING);
        
        try {
            const sourceFormat = subtitles[0]?.format || 'unknown';
            const converterKey = `${sourceFormat}-${targetFormat}`;
            
            const converter = this.converters.get(converterKey);
            if (!converter) {
                throw new Error(`No converter available for ${converterKey}`);
            }
            
            const convertedSubtitles = await converter(subtitles);
            
            this.updateStatus(STATUS_INDICATORS.subtitleProcessing.SUCCESS);
            return convertedSubtitles;
            
        } catch (error) {
            this.updateStatus(STATUS_INDICATORS.subtitleProcessing.ERROR);
            throw new Error(`${ERROR_MESSAGES.subtitleProcessing.CONVERSION_FAILED}: ${error.message}`);
        }
    }

    /**
     * Convert SRT to VTT format
     * @param {Array} srtSubtitles - SRT subtitles
     * @returns {Array} VTT subtitles
     */
    convertSRTtoVTT(srtSubtitles) {
        return srtSubtitles.map(subtitle => ({
            ...subtitle,
            format: 'vtt',
            start: this.convertSRTTimeToVTT(subtitle.start),
            end: this.convertSRTTimeToVTT(subtitle.end)
        }));
    }

    /**
     * Convert VTT to SRT format
     * @param {Array} vttSubtitles - VTT subtitles
     * @returns {Array} SRT subtitles
     */
    convertVTTtoSRT(vttSubtitles) {
        return vttSubtitles.map((subtitle, index) => ({
            ...subtitle,
            format: 'srt',
            id: index + 1,
            start: this.convertVTTTimeToSRT(subtitle.start),
            end: this.convertVTTTimeToSRT(subtitle.end)
        }));
    }

    /**
     * Convert ASS to SRT format
     * @param {Array} assSubtitles - ASS subtitles
     * @returns {Array} SRT subtitles
     */
    convertASStoSRT(assSubtitles) {
        return assSubtitles.map((subtitle, index) => ({
            id: index + 1,
            start: subtitle.start,
            end: subtitle.end,
            text: subtitle.text,
            format: 'srt',
            originalFormat: 'ass'
        }));
    }

    /**
     * Convert SRT to ASS format
     * @param {Array} srtSubtitles - SRT subtitles
     * @returns {Array} ASS subtitles
     */
    convertSRTtoASS(srtSubtitles) {
        return srtSubtitles.map(subtitle => ({
            start: subtitle.start,
            end: subtitle.end,
            text: subtitle.text,
            format: 'ass',
            originalFormat: 'srt',
            actor: '',
            effect: '',
            styling: {}
        }));
    }

    /**
     * Convert SRT time to VTT time format
     * @param {number} time - Time in seconds
     * @returns {string} VTT time string
     */
    convertSRTTimeToVTT(time) {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor((time % 1) * 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }

    /**
     * Convert VTT time to SRT time format
     * @param {number} time - Time in seconds
     * @returns {string} SRT time string
     */
    convertVTTTimeToSRT(time) {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor((time % 1) * 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
    }

    /**
     * Update processing status
     * @param {Object} status - New status
     */
    updateStatus(status) {
        this.processingStatus = status;
        this.emit('statusChange', status);
    }

    /**
     * Get current processing status
     * @returns {Object} Current status
     */
    getProcessingStatus() {
        return this.processingStatus;
    }

    /**
     * Get supported formats
     * @returns {Array} Supported format information
     */
    getSupportedFormats() {
        return SUBTITLE_FORMATS;
    }

    /**
     * Clear subtitle cache
     */
    clearCache() {
        this.subtitleCache.clear();
    }

    /**
     * Destroy the subtitle manager
     */
    destroy() {
        this.clearCache();
        this.removeAllListeners();
        this.processingQueue = [];
        this.isProcessing = false;
    }
}

module.exports = SubtitleManager;