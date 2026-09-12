import React, { useEffect, useState } from 'react';
import { Download, Images, Share2, Trash2 } from 'lucide-react';
import { downloadBlob } from '../lib/photos.js';

function GalleryCard({ item, onShare, onDelete }) {
  const [url, setUrl] = useState('');
  useEffect(() => { const next = URL.createObjectURL(item.blob); setUrl(next); return () => URL.revokeObjectURL(next); }, [item.blob]);
  return <article className="gallery-card"><div className="gallery-image">{url && <img src={url} alt={`Photostrip from ${new Date(item.timestamp).toLocaleDateString()}`} loading="lazy" />}</div>
    <div className="gallery-info"><h3>{new Date(item.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</h3><p>{item.filter} · {item.photoCount} {item.photoCount === 1 ? 'photo' : 'poses'}</p>
      <div className="gallery-actions"><button className="text-button" onClick={() => downloadBlob(item.blob, item.filename)}><Download size={15} />Download</button><button className="icon-button" aria-label="Share photostrip" onClick={() => onShare(item)}><Share2 size={16} /></button><button className="icon-button" aria-label="Delete photostrip" onClick={() => onDelete(item)}><Trash2 size={16} /></button></div>
    </div></article>;
}
export default function Gallery({ items, loading, onStudio, onShare, onDelete }) {
  return <section className="gallery-page"><div className="section-heading"><div><p className="eyebrow">Your keepsakes</p><h1>A little collection of you.</h1><p>Saved on this browser, on this device.</p></div><span className="count-label">{items.length} saved {items.length === 1 ? 'strip' : 'strips'}</span></div>
    {loading ? <p role="status">Opening your gallery…</p> : !items.length ? <div className="gallery-empty"><Images size={42} strokeWidth={1} /><h2>Good moments belong here.</h2><p>Your photostrips will appear here.</p><button className="button primary" onClick={onStudio}>Make your first strip</button></div> : <div className="gallery-grid">{items.map(item => <GalleryCard key={item.id} item={item} onShare={onShare} onDelete={onDelete} />)}</div>}
  </section>;
}
