// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('@stremio/stremio-icons/react');
const styles = require('./styles');

/**
 * FormField wrapper component that adds label, validation, and error feedback
 */
const FormField = ({
    className,
    label,
    required,
    error,
    success,
    helperText,
    children,
    ...props
}) => {
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success) && !hasError;

    return (
        <div className={classnames(className, styles['form-field'], {
            [styles['error']]: hasError,
            [styles['success']]: hasSuccess,
            [styles['required']]: required
        })} {...props}>
            {
                typeof label === 'string' && label.length > 0 ?
                    <label className={styles['label']}>
                        {label}
                        {required && <span className={styles['required-indicator']}> *</span>}
                    </label>
                    :
                    null
            }
            <div className={styles['input-wrapper']}>
                {children}
                {
                    hasError || hasSuccess ?
                        <div className={styles['status-icon']}>
                            <Icon
                                className={styles['icon']}
                                name={hasError ? 'ic_warning' : 'checkmark'}
                            />
                        </div>
                        :
                        null
                }
            </div>
            {
                hasError && typeof error === 'string' ?
                    <div className={styles['error-message']}>
                        {error}
                    </div>
                    :
                    null
            }
            {
                !hasError && typeof helperText === 'string' && helperText.length > 0 ?
                    <div className={styles['helper-text']}>
                        {helperText}
                    </div>
                    :
                    null
            }
        </div>
    );
};

FormField.propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    required: PropTypes.bool,
    error: PropTypes.string,
    success: PropTypes.bool,
    helperText: PropTypes.string,
    children: PropTypes.node.isRequired
};

module.exports = FormField;
