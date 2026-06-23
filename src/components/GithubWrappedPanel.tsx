import { useState } from 'react';
import type { DeveloperProfile } from '../types/profile';

export function GithubWrappedPanel({ profile }: { profile: DeveloperProfile }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const topSkill = profile.skills && profile.skills.length > 0 ? profile.skills[0].name.replace(' Mastery', '') : 'Copy-Pasting';
  const randomToxicTrait = profile.toxicTraits && profile.toxicTraits.length > 0 
    ? profile.toxicTraits[Math.floor(Math.random() * profile.toxicTraits.length)] 
    : 'Being entirely unremarkable.';

  const slides = [
    {
      title: "Ready for your GitHub Wrapped?",
      subtitle: "We analyzed your entirely public, completely embarrassing coding history for the past year.",
      icon: "🎁",
      color: "var(--git-blue)"
    },
    {
      title: `${profile.totalCommits.toLocaleString()} Commits`,
      subtitle: `That's how many times you blindly typed 'git commit -m "fix"' without testing.`,
      icon: "💻",
      color: "var(--git-orange)"
    },
    {
      title: `Top Language: ${topSkill}`,
      subtitle: `You spent most of your year writing ${topSkill}. We're so sorry.`,
      icon: "🔥",
      color: "var(--git-red)"
    },
    {
      title: `The Social Network`,
      subtitle: `You have ${profile.followers || 0} followers. Try being nicer in your PR reviews.`,
      icon: "👀",
      color: "var(--git-purple)"
    },
    {
      title: `Your Defining Trait`,
      subtitle: `"${randomToxicTrait}"`,
      icon: "☢️",
      color: "var(--git-green)"
    },
    {
      title: `Final Grade: ${profile.grade}`,
      subtitle: `Title: ${profile.title}. Try harder next year.`,
      icon: "🎓",
      color: "var(--text-main)"
    }
  ];

  const playSound = (type: 'beep' | 'levelUp') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      
      if (type === 'beep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'levelUp') {
        // Play an arpeggio
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.2);
        });
      }
    } catch (e) {
      console.warn('Audio not supported or blocked');
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(curr => curr + 1);
      if (currentSlide + 1 === slides.length - 1) {
        playSound('levelUp');
      } else {
        playSound('beep');
      }
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(curr => curr - 1);
      playSound('beep');
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="card" style={{ padding: '48px 24px', backgroundColor: '#000', border: `2px solid ${slide.color}`, borderRadius: '12px', minHeight: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', transition: 'border-color 0.5s ease' }}>
      
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: slide.color, opacity: 0.1, filter: 'blur(100px)', borderRadius: '50%', transition: 'background 0.5s ease' }} />

      <div style={{ fontSize: '5rem', marginBottom: '24px', zIndex: 1, animation: 'bounce 2s infinite' }}>
        {slide.icon}
      </div>
      
      <h2 style={{ fontSize: '2.5rem', margin: '0 0 16px 0', color: slide.color, textAlign: 'center', zIndex: 1, textShadow: '0 2px 10px rgba(0,0,0,0.5)', transition: 'color 0.5s ease' }}>
        {slide.title}
      </h2>
      
      <p style={{ fontSize: '1.25rem', color: '#fff', textAlign: 'center', maxWidth: '600px', lineHeight: 1.5, zIndex: 1, opacity: 0.9 }}>
        {slide.subtitle}
      </p>

      <div style={{ position: 'absolute', bottom: '32px', display: 'flex', gap: '16px', zIndex: 1 }}>
        <button onClick={prevSlide} disabled={currentSlide === 0} style={{ padding: '8px 24px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '24px', cursor: currentSlide === 0 ? 'not-allowed' : 'pointer', opacity: currentSlide === 0 ? 0.3 : 1, fontSize: '1rem', fontWeight: 600 }}>
          Back
        </button>
        <button onClick={nextSlide} disabled={currentSlide === slides.length - 1} style={{ padding: '8px 24px', background: slide.color, color: '#000', border: 'none', borderRadius: '24px', cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer', opacity: currentSlide === slides.length - 1 ? 0.3 : 1, fontSize: '1rem', fontWeight: 600, transition: 'background 0.5s ease' }}>
          Next
        </button>
      </div>

      {/* Progress Dots */}
      <div style={{ position: 'absolute', bottom: '16px', display: 'flex', gap: '8px', zIndex: 1 }}>
        {slides.map((_, idx) => (
          <div key={idx} style={{ width: '8px', height: '8px', borderRadius: '50%', background: idx === currentSlide ? slide.color : 'rgba(255,255,255,0.2)', transition: 'background 0.5s ease' }} />
        ))}
      </div>
    </div>
  );
}
