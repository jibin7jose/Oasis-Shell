import React, { useEffect } from 'react';
import { useSystemStore } from "../../lib/systemStore";

export const RefractionManager: React.FC = () => {
    const { ventureIntegrity, performanceOptimized } = useSystemStore();

    useEffect(() => {
        const root = document.documentElement;
        
        // --- Calculate Refractive Parameters ---
        
        // 1. Blur Intensity (Higher integrity = Crisper blurs)
        let blurVal = 32;
        if (ventureIntegrity < 30) blurVal = 12;
        else if (ventureIntegrity < 60) blurVal = 20;
        
        if (performanceOptimized) blurVal = Math.min(blurVal, 12);

        // 2. Saturation (Higher integrity = More vibrant)
        let satVal = "160%";
        if (ventureIntegrity < 40) satVal = "80%";
        else if (ventureIntegrity < 70) satVal = "120%";

        // 3. Border Density (Lower integrity = More 'visible' structure/stress)
        let borderOpac = 0.08;
        if (ventureIntegrity < 20) borderOpac = 0.4;
        else if (ventureIntegrity < 50) borderOpac = 0.2;

        // 4. Grain Level (Simulating noise on failure)
        let grainVal = 0;
        if (ventureIntegrity < 30) grainVal = 0.3;

        // --- Apply Molecular Shift ---
        root.style.setProperty('--refraction-blur', `${blurVal}px`);
        root.style.setProperty('--refraction-saturation', satVal);
        root.style.setProperty('--refraction-border-opacity', borderOpac.toString());
        root.style.setProperty('--refraction-grain', grainVal.toString());

        // Emit Pulse Log on significant shifts
        if (ventureIntegrity < 50) {
            console.log(`[Refraction] Sentient Atmosphere Shift: Integrity Breach detected. Morphing UI structure to 'Stress' mode.`);
        }

    }, [ventureIntegrity, performanceOptimized]);

    return (
        <>
            {/* Grain Overlay: Manifests only when Integrity is low */}
            <div 
                className="fixed inset-0 pointer-events-none z-[9999] opacity-30 mix-blend-overlay transition-opacity duration-1000"
                style={{ 
                    backgroundImage: `url("https://grainy-gradients.vercel.app/noise.svg")`,
                    opacity: ventureIntegrity < 40 ? 0.2 : 0,
                    filter: `contrast(150%) brightness(1000%) invert(${ventureIntegrity < 20 ? 1 : 0})`
                }}
            />
        </>
    );
};
 Arkansas Arkansas
