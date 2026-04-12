import os

css_code = """

/* --- COMPREHENSIVE MOBILE RESPONSIVENESS OVERRIDES --- */
@media (max-width: 768px) {
  /* Override inline hardcoded grids to force stacking */
  .grid[style*="grid-template-columns"] {
    grid-template-columns: 1fr !important;
  }
  
  /* Fix block horizontal flex overflows */
  .flex[style*="flex-direction: row"], 
  .flex.md-flex-row {
    flex-direction: column !important;
  }
  
  /* Fix Hero Animation Width */
  .hero-animation {
    width: 100% !important;
    max-width: 320px !important;
    height: 320px !important;
    transform: scale(0.65) !important;
    margin: 0 auto;
  }
  
  /* Reduce Padding in Glass Cards and Panels */
  .glass-card[style*="padding"], .glass-panel[style*="padding"] {
    padding: 1.2rem !important;
  }
  
  /* Reduce excessive margins */
  div[style*="margin-bottom: 4rem"], div[style*="margin-bottom: 3rem"] {
    margin-bottom: 1.5rem !important;
  }
  
  div[style*="gap: 4rem"] {
    gap: 1.5rem !important;
  }
  
  /* Adjust typography to prevent overflow */
  .gradient-text, h2[style*="3.5rem"], h2[style*="3rem"], h2.voice-target {
    font-size: 2.2rem !important;
  }

  /* Fix Calculator Modal Positioning & Size */
  .calc-modal {
    width: 90vw !important;
    max-width: 340px;
    padding: 1rem !important;
  }
  
  .calc-btn {
    height: 50px !important;
    font-size: 1.1rem !important;
  }
  
  .floating-calc-btn {
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
  }
  
  /* Modals width fixing */
  .glass-card[style*="max-width: 500px"], .glass-card[style*="max-width: 600px"] {
    padding: 1.5rem !important;
  }
  
  /* Fix input sizes to prevent iOS zoom */
  input, select, textarea {
    font-size: 16px !important;
  }

  /* Reduce sim stage heights */
  #ff-sim-stage, #hooke-sim-stage, #impulse-sim-stage {
    height: 350px !important;
  }
}
"""

with open('/Users/yesbolgansattar/Desktop/IBB/style.css', 'a', encoding='utf-8') as f:
    f.write(css_code)
print("done")
