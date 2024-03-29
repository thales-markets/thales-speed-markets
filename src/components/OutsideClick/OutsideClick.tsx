import React, { useRef, useEffect } from 'react';

const OutsideClickHandler: React.FC<any> = ({ children, onOutsideClick }) => {
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event: any) => {
            if (wrapperRef.current && !(wrapperRef.current as any).contains(event.target)) {
                onOutsideClick();
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('touchstart', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
        };
    }, [onOutsideClick]);

    return <div ref={wrapperRef}>{children}</div>;
};

export default OutsideClickHandler;
