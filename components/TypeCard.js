export default function TypeCard({ type, active = false, onClick, onOpen, compact = false }) {
  return (
    <div className={`type-card${active ? ' active' : ''}${compact ? ' compact' : ''}`} onClick={onClick} role="button" tabIndex={0}>
      <div className="type-image">
        {type.imageData ? (
          <img src={type.imageData} alt={type.name} />
        ) : (
          <span>{type.imageLabel || 'صورة'}</span>
        )}
      </div>
      <div className="tag">نوع</div>
      <div>
        <h3>{type.name}</h3>
        {!compact ? <p>{type.description}</p> : null}
      </div>
      {onOpen ? <button className="mini-open" onClick={(event) => { event.stopPropagation(); onOpen(); }}>فتح</button> : null}
    </div>
  );
}
