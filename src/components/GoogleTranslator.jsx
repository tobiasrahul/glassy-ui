import React, { useEffect, useState } from 'react';

const GoogleTranslate = () => {
  const [currentLang, setCurrentLang] = useState(
    typeof window !== 'undefined' ? (localStorage.getItem('preferredLang') || 'en') : 'en'
  );

  const changeLanguage = lang => {
    try {
      // Save preference
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferredLang', lang);
      }

      const apply = () => {
        const combo = document.querySelector('.goog-te-combo');
        if (combo) {
          combo.value = lang;
          combo.dispatchEvent(new Event('change'));
        } else {
          // Retry shortly if the widget hasn't initialized yet
          setTimeout(() => apply(), 500);
        }
      };

      apply();
    } catch (e) {
      // ignore
    }
  };

  // Re-apply translation when preferred language changes (handles SPA navigation)
  useEffect(() => {
    if (currentLang && currentLang !== 'en') {
      changeLanguage(currentLang);
    }
  }, [currentLang]);

  useEffect(() => {
    window.googleTranslateInit = () => {
      if (!window.google?.translate?.TranslateElement) {
        setTimeout(window.googleTranslateInit, 100);
      } else {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages:
              'en,hi,pa,sa,mr,ur,bn,es,ja,ko,zh-CN,es,nl,fr,de,it,ta,te,gu',
            layout:
              window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
            defaultLanguage: 'en',
            autoDisplay: false,
          },
          'google_element',
        );
      }
      cleanUpGadgetText();
    };

    const loadGoogleTranslateScript = () => {
      if (!document.getElementById('google_translate_script')) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src =
          'https://translate.google.com/translate_a/element.js?cb=googleTranslateInit';
        script.id = 'google_translate_script';
        script.onerror = () =>
          console.error('Error loading Google Translate script');
        document.body.appendChild(script);
      }
    };
    const cleanUpGadgetText = () => {
      const gadgetElement = document.querySelector('.goog-te-gadget');
      if (gadgetElement) {
        const textNodes = gadgetElement.childNodes;
        textNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            node.textContent = ''; // Clear text content
          }
        });
      }
    };

    // Ensure code snippets are not translated: add `notranslate` to all <pre> and <code> elements
    const applyNotranslateToCode = () => {
      try {
        document.querySelectorAll('pre, code').forEach(el => {
          el.classList.add('notranslate');
        });
      } catch (e) {
        // ignore
      }
    };

    // Apply initial and observe future DOM changes (single page app navigation)
    applyNotranslateToCode();
    const observer = new MutationObserver(() => applyNotranslateToCode());
    observer.observe(document.body, { childList: true, subtree: true });

    loadGoogleTranslateScript();

    if (window.google && window.google.translate) {
      window.googleTranslateInit();
    }

    return () => {
      // Cleanup observer
      try {
        observer.disconnect();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return (
    <div className='google-translate-wrapper'>
      <div className='google-translate-container'>
        <select
          id='customLangSelect'
          className='translate-select'
          value={currentLang}
          onChange={e => {
            const lang = e.target.value;
            setCurrentLang(lang);
            changeLanguage(lang);
          }}
          aria-label='Select language'
        >
          <option value='en'>English</option>
          <option value='hi'>Hindi</option>
          <option value='pa'>Punjabi</option>
          <option value='sa'>Sanskrit</option>
          <option value='mr'>Marathi</option>
          <option value='ur'>Urdu</option>
          <option value='bn'>Bengali</option>
          <option value='es'>Spanish</option>
          <option value='ja'>Japanese</option>
          <option value='ko'>Korean</option>
          <option value='zh-CN'>Chinese (Simplified)</option>
          <option value='nl'>Dutch</option>
          <option value='fr'>French</option>
          <option value='de'>German</option>
          <option value='it'>Italian</option>
          <option value='ta'>Tamil</option>
          <option value='te'>Telugu</option>
          <option value='gu'>Gujarati</option>
        </select>

        {/* Google widget target */}
        <div id='google_element' />
      </div>

      <style jsx>{`
        .google-translate-wrapper {
          z-index: 9999;
        }

        .google-translate-container {
          position: fixed;
          left: 12px; /* slight adjustment */
          top: 12px;  /* slight adjustment */
          z-index: 9999;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .translate-select {
          background-color: #272d39;
          color: #fff;
          border-radius: 0.4rem;
          padding: 0.4rem 0.6rem;
          font-size: 0.95rem;
          outline: none;
          font-weight: 500;
          cursor: pointer;
          border: 0;
        }

        .translate-select:focus {
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.12);
        }

        /* Keep Google widget styles but slightly adjusted */
        .goog-te-combo {
          background-color: transparent !important;
          color: #fff !important;
        }

        .goog-logo-link {
          display: none !important; /* Hide Google logo */
        }

        .goog-te-banner-frame {
          display: none !important; /* Hide the banner frame */
        }

        .goog-te-menu-frame {
          max-height: 400px !important;
          overflow-y: auto !important;
          background-color: #ffffff; /* White background for dropdown */
          border: 2px solid #007bff; /* Blue border */
          border-radius: 0.75rem; /* Rounded corners */
          box-shadow: 0 4px 8px rgba(0, 123, 255, 0.1); /* Soft blue shadow */
        }

        @media (max-width: 640px) {
          .google-translate-container {
            left: 8px;
            top: 8px;
          }

          .translate-select {
            padding: 0.35rem 0.5rem;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};

export default GoogleTranslate;
