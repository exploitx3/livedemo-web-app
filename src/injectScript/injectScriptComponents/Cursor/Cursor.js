import React, {forwardRef, useEffect, useRef} from "react";
import styled from 'styled-components'

const Cursor = forwardRef(({moveCursor}, ref) => {
    const cursorRef = useRef(null);
    const xAdjust = -15
    const yAdjust = -5

    // useEffect(() => {
    //     const moveCursor = (e) => {
    //         const cursor = cursorRef.current;
    //         if (cursor) {
    //             cursor.style.transform = `translate3d(${e.clientX + xAdjust}px, ${e.clientY + yAdjust}px, 0)`;
    //         }
    //     };
    //
    //     document.addEventListener("mousemove", moveCursor);
    //
    //     // Hide native cursor
    //     // document.body.style.cursor = "none";
    //
    //     return () => {
    //         document.removeEventListener("mousemove", moveCursor);
    //         document.body.style.cursor = "default"; // Restore
    //     };
    // }, []);

    return (
        <C.CursorWrapper
            id={"custom-cursor"}
            ref={ref}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "48px",
                height: "48px",
                pointerEvents: "none",
                transform: "translate3d(0, 0, 0)",
                zIndex: 9999,
            }}
        >
            {/* 👇 Replace this SVG with your own */}
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#filter0_d_2_333)">
                    <path
                        d="M15.9231 18.0296C16.0985 18.4505 15.9299 20.0447 15 20.4142C14.0701 20.7837 12.882 20.4142 12.882 20.4142L10.726 16.1024L7 19.8284V3L18.4142 14.4142H14.1615C14.3702 14.8144 15.7003 17.4948 15.9231 18.0296Z"
                        fill="white"/>
                    <path fill-rule="evenodd" clip-rule="evenodd"
                          d="M8 5.41422V17.4142L11 14.4142L13.5 19.4142C13.5 19.4142 14.1763 19.63 14.5 19.4142C14.8237 19.1984 15.1457 18.7638 15 18.4142C14.3123 16.7638 12.5 13.4142 12.5 13.4142H16L8 5.41422Z"
                          fill="black"/>
                </g>
                <defs>
                    <filter id="filter0_d_2_333" x="5.2" y="2.2" width="15.0142" height="21.1784"
                            filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                       result="hardAlpha"/>
                        <feOffset dy="1"/>
                        <feGaussianBlur stdDeviation="0.9"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.65 0"/>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2_333"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2_333" result="shape"/>
                    </filter>
                </defs>
            </svg>

        </C.CursorWrapper>
    );
});

const C = {
    CursorWrapper: styled.div`
        @keyframes clicking {
            0% {
                transform: scale(1); /* press down */
                opacity: 1;
                
            }
            20% {
                transform: scale(0.8); /* press down */
                opacity: 1;
                
            }
            40% {
                transform: scale(1.1); /* bounce back slightly larger */
                opacity: 1;
                
            }
            100% {
                transform: scale(1); /* settle at normal */
                opacity: 1;
                
            }
        }
        
        @keyframes clickingStop {
            0% {
                transform: scale(1); /* press down */
                opacity: 1;
                
            }
            20% {
                transform: scale(0.8); /* press down */
                opacity: 1;
                
            }
            40% {
                transform: scale(1.1); /* bounce back slightly larger */
                opacity: 1;
                
            }
            100% {
                transform: scale(1); /* settle at normal */
                opacity: 0;
                
            }
        }

        /* Default state */
        && {
            opacity: 0;
            transform: scale(1);
            transition: opacity 0.2s, top 0.55s, left 0.55s ease-in-out;
        }

        /* Triggered state — animation only when .active is added */
        &&.cursor-click-animate {
            
            animation: clicking 0.9s ease-out infinite;
            animation-delay: 1s;
            opacity: 1;
        }
        
        &&.cursor-click-animate-stop {
            animation: clickingStop 0.4s ease-out forwards;
        }
        
        && svg {
            width: 100%;
            height: 100%;
        }
    `
}

export default Cursor;