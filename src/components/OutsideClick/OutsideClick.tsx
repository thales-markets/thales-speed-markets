import React, { useRef, useEffect } from 'react';

const OutsideClickHandler: React.FC<any> = ({ children, onOutsideClick }) => {
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event: any) => {
            if (wrapperRef.current && !(wrapperRef.current as any).contains(event.target)) {
                onOutsideClick();
            }
        };
        document.addEventListener('mouseup', handleOutsideClick);
        document.addEventListener('touchend', handleOutsideClick);

        return () => {
            document.removeEventListener('mouseup', handleOutsideClick);
            document.removeEventListener('touchend', handleOutsideClick);
        };
    }, [onOutsideClick]);

    return <div ref={wrapperRef}>{children}</div>;
};

export default OutsideClickHandler;
