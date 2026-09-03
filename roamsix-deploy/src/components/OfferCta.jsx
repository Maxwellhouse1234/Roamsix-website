import { Link } from 'react-router-dom';
import { resolveOfferState } from '../lib/offerState';
import { trackEvent } from '../lib/analytics';

export default function OfferCta({ offer, position = 'unknown', secondary = false }) {
  const state = resolveOfferState(offer.offerStatus);
  if (!state.href || !state.label) return <p className="status-note">{state.message}</p>;

  return (
    <Link
      className={secondary ? 'button button-secondary' : 'button'}
      to={state.href}
      onClick={() => trackEvent('retreat_cta_click', {
        retreat_slug: offer.slug,
        offer_status: offer.offerStatus,
        cta_position: position,
      })}
    >
      {state.label}
    </Link>
  );
}

