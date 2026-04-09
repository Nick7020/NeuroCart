export function Footer() {
  return (
    <footer style={{ background: '#0c0e14', color: '#a0a0b0', fontFamily: 'inherit' }}>

      {/* Back to top */}
      <div
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          background: 'rgba(255,255,255,0.04)',
          textAlign: 'center',
          padding: '13px',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.5)',
          cursor: 'pointer',
          letterSpacing: '0.8px',
          fontWeight: 500,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
      >
        ↑ BACK TO TOP
      </div>

      {/* Main columns */}
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '48px 24px 32px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '36px',
      }}>
        {/* About */}
        <div>
          <h3 style={headingStyle}>About NeuroCart</h3>
          <ul style={listStyle}>
            {['About Us', 'Careers', 'Press Releases', 'NeuroCart Science'].map(item => (
              <li key={item}>
                <a href="#" style={linkStyle}
                  onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.paddingLeft = '4px' }}
                  onMouseLeave={e => { e.target.style.color = '#a0a0b0'; e.target.style.paddingLeft = '0' }}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 style={headingStyle}>Help</h3>
          <ul style={listStyle}>
            {['Payments', 'Shipping', 'Cancellation & Returns', 'FAQ', 'Report Infringement'].map(item => (
              <li key={item}>
                <a href="#" style={linkStyle}
                  onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.paddingLeft = '4px' }}
                  onMouseLeave={e => { e.target.style.color = '#a0a0b0'; e.target.style.paddingLeft = '0' }}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Policy */}
        <div>
          <h3 style={headingStyle}>Policy</h3>
          <ul style={listStyle}>
            {['Return Policy', 'Terms of Use', 'Security', 'Privacy', 'Sitemap', 'EPR Compliance'].map(item => (
              <li key={item}>
                <a href="#" style={linkStyle}
                  onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.paddingLeft = '4px' }}
                  onMouseLeave={e => { e.target.style.color = '#a0a0b0'; e.target.style.paddingLeft = '0' }}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 style={headingStyle}>Social</h3>
          <ul style={listStyle}>
            {[
              { name: 'Facebook',   icon: '📘' },
              { name: 'Twitter / X', icon: '🐦' },
              { name: 'Instagram',  icon: '📸' },
              { name: 'YouTube',    icon: '▶️' },
              { name: 'LinkedIn',   icon: '💼' },
            ].map(({ name, icon }) => (
              <li key={name}>
                <a href="#" style={linkStyle}
                  onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.paddingLeft = '4px' }}
                  onMouseLeave={e => { e.target.style.color = '#a0a0b0'; e.target.style.paddingLeft = '0' }}>
                  {icon} {name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Address */}
        <div>
          <h3 style={headingStyle}>Registered Office</h3>
          <p style={{ fontSize: '12px', lineHeight: '1.9', color: '#6a6a7a' }}>
            NeuroCart Internet Pvt. Ltd.<br />
            Brigade Gateway, 8th Floor<br />
            26/1, Dr. Rajkumar Road<br />
            Bangalore – 560055<br />
            Karnataka, India<br /><br />
            📞 1800-XXX-XXXX (Toll Free)<br />
            ✉️ support@neurocart.com
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', maxWidth: '1280px', margin: '0 auto' }} />

      {/* Language & Country */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <select style={selectStyle}>
          <option>🌐 English</option>
          <option>🌐 Hindi</option>
          <option>🌐 Tamil</option>
          <option>🌐 Telugu</option>
        </select>
        <select style={selectStyle}>
          <option>🇮🇳 India</option>
          <option>🇺🇸 United States</option>
          <option>🇬🇧 United Kingdom</option>
        </select>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', maxWidth: '1280px', margin: '0 auto' }} />

      {/* Bottom bar */}
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: '20px 24px',
        display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(135deg,#FFC570,#e8a020)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            NeuroCart
          </span>
          <span style={{ fontSize: '11px', color: '#4a4a5a' }}>
            © {new Date().getFullYear()} NeuroCart.com. All rights reserved.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: '#4a4a5a', marginRight: '4px' }}>We Accept:</span>
          {['💳 Visa', '💳 Mastercard', '🏦 NetBanking', '📱 UPI', '💰 COD', '🎁 Gift Card'].map(p => (
            <span key={p} style={{
              background: 'rgba(255,255,255,0.05)',
              color: '#7a7a8a',
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              {p}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}

const headingStyle = {
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 700,
  marginBottom: '14px',
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
}

const listStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '9px',
}

const linkStyle = {
  color: '#a0a0b0',
  textDecoration: 'none',
  fontSize: '13px',
  transition: 'color 0.18s, padding-left 0.18s',
  display: 'inline-block',
}

const selectStyle = {
  background: 'rgba(255,255,255,0.05)',
  color: '#a0a0b0',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  padding: '6px 12px',
  fontSize: '12px',
  cursor: 'pointer',
  outline: 'none',
}
