import { useSearchParams } from 'react-router';
import { EnquiryForm, GoogleReviewLink, Icon, PageHead, ReviewList, Seo } from '../components.jsx';
import { WhatsAppQr } from '../features.jsx';
import { telLink, useApi, waLink } from '../lib.js';
import { pageMeta } from '../seo.js';

export default function Contact() {
  const { data: site } = useApi('/api/site');
  const [params] = useSearchParams();

  return (
    <>
      <Seo {...pageMeta('/contact', site)} />
      <PageHead h1={pageMeta('/contact', site).h1} title="Talk to a real person.">
        <p>WhatsApp is the fastest way to reach us. Prefer a form? Fill it in and we’ll call or message you back.</p>
      </PageHead>
      <section className="wrap contact-grid">
        <div className="contact-cards">
          {site && (
            <>
              <a className="contact-card is-wa" data-track="whatsapp" href={waLink(site.whatsappNumber, site.whatsappMessage)} target="_blank" rel="noreferrer">
                <Icon name="whatsapp" size={24} /><span><strong>WhatsApp</strong>Start a chat — quickest reply</span>
              </a>
              <a className="contact-card" href={telLink(site.phone)}>
                <Icon name="phone" size={24} /><span><strong>{site.phone}</strong>Call us</span>
              </a>
              {site.email && (
                <a className="contact-card" href={`mailto:${site.email}`}>
                  <Icon name="mail" size={24} /><span><strong>{site.email}</strong>Email</span>
                </a>
              )}
              {site.address && (site.mapUrl ? (
                <a className="contact-card" href={site.mapUrl} target="_blank" rel="noreferrer">
                  <Icon name="pin" size={24} /><span><strong>Visit us</strong>{site.address}</span>
                </a>
              ) : (
                <p className="contact-card"><Icon name="pin" size={24} /><span><strong>Visit us</strong>{site.address}</span></p>
              ))}
              <WhatsAppQr site={site} />
              {site.hours && <p className="contact-hours"><Icon name="clock" size={18} />{site.hours}</p>}
              {site.whatsappCatalogueUrl && <a className="link-arrow" href={site.whatsappCatalogueUrl} target="_blank" rel="noreferrer">Browse our WhatsApp catalogue<Icon name="arrow" size={16} /></a>}
            </>
          )}
        </div>
        <div className="form-card" id="enquiry">
          <h2>Send an enquiry</h2>
          <EnquiryForm site={site} initial={Object.fromEntries(params)} />
        </div>
      </section>
      <section className="section wrap" id="reviews" aria-labelledby="reviews-h">
        <p className="eyebrow">Reviews</p>
        <h2 id="reviews-h">What travellers say</h2>
        <ReviewList />
        <div className="review-cta"><GoogleReviewLink /></div>
      </section>
    </>
  );
}
