export function Footer() {
  return (
    <footer style={{ background: '#0f1111', color: '#ccc', fontFamily: 'inherit' }}>

      {/* Back to top */}
      <div
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ background: '#232f3e', textAlign: 'center', padding: '14px', fontSize: '13px', color: '#fff', cursor: 'pointer', letterSpacing: '0.5px' }}
        onMouseEnter={e => e.currentTarget.style.background = '#37475a'}
        onMouseLeave={e => e.currentTarget.style.background = '#232f3e'}
      >
        ↑ Back to top
      </div>

      {/* Main columns */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '32px' }}>

        {/* About */}
        <div>
          <h3 style={headingStyle}>About NeuroCart</h3>
          <ul style={listStyle}>
            {['About Us', 'Careers', 'Press Releases', 'NeuroCart Science'].map(item => (
              <li key={item}><a href="#" style={linkStyle} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#ccc'}>{item}</a></li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 style={headingStyle}>Help</h3>
          <ul style={listStyle}>
            {['Payments', 'Shipping', 'Cancellation & Returns', 'FAQ', 'Report Infringement'].map(item => (
              <li key={item}><a href="#" style={linkStyle} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#ccc'}>{item}</a></li>
            ))}
          </ul>
        </div>

        {/* Policy */}
        <div>
          <h3 style={headingStyle}>Policy</h3>
          <ul style={listStyle}>
            {['Return Policy', 'Terms of Use', 'Security', 'Privacy', 'Sitemap', 'EPR Compliance'].map(item => (
              <li key={item}><a href="#" style={linkStyle} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#ccc'}>{item}</a></li>
            ))}
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 style={headingStyle}>Social</h3>
          <ul style={listStyle}>
            {[
              { name: 'Facebook', icon: '📘' },
              { name: 'Twitter / X', icon: '🐦' },
              { name: 'Instagram', icon: '📸' },
              { name: 'YouTube', icon: '▶️' },
              { name: 'LinkedIn', icon: '💼' },
            ].map(({ name, icon }) => (
              <li key={name}><a href="#" style={linkStyle} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#ccc'}>{icon} {name}</a></li>
            ))}
          </ul>
        </div>

        {/* Sell / Partner */}
        <div>
          <h3 style={headingStyle}>Sell on NeuroCart</h3>
          <ul style={listStyle}>
            {['Become a Seller', 'Advertise', 'NeuroCart Business', 'Gift Cards', 'NeuroCart Pay'].map(item => (
              <li key={item}><a href="#" style={linkStyle} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#ccc'}>{item}</a></li>
            ))}
          </ul>
        </div>

        {/* Address */}
        <div>
          <h3 style={headingStyle}>Registered Office</h3>
          <p style={{ fontSize: '12px', lineHeight: '1.8', color: '#aaa' }}>
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
      <div style={{ borderTop: '1px solid #3a3a3a', maxWidth: '1280px', margin: '0 auto' }} />

      {/* Language & Country */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
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
      <div style={{ borderTop: '1px solid #3a3a3a', maxWidth: '1280px', margin: '0 auto' }} />

      {/* Bottom bar */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>

        {/* Logo + copyright */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#FFC570', letterSpacing: '-0.5px' }}>NeuroCart</span>
          <span style={{ fontSize: '12px', color: '#888' }}>© {new Date().getFullYear()} NeuroCart.com. All rights reserved.</span>
        </div>

        {/* Payment icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: '#888', marginRight: '4px' }}>We Accept:</span>
          {['💳 Visa', '💳 Mastercard', '🏦 NetBanking', '📱 UPI', '💰 COD', '🎁 Gift Card'].map(p => (
            <span key={p} style={{ background: '#232f3e', color: '#ccc', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #3a3a3a' }}>{p}</span>
          ))}
        </div>

      </div>

    </footer>
  )
}

const headingStyle = {
  color: '#fff',
  fontSize: '14px',
  fontWeight: '700',
  marginBottom: '12px',
  letterSpacing: '0.3px',
}

const listStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

const linkStyle = {
  color: '#ccc',
  textDecoration: 'none',
  fontSize: '13px',
  transition: 'color 0.2s',
}

const selectStyle = {
  background: '#0f1111',
  color: '#ccc',
  border: '1px solid #555',
  borderRadius: '4px',
  padding: '6px 10px',
  fontSize: '13px',
  cursor: 'pointer',
}
