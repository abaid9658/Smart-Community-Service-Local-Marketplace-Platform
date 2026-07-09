import Link from 'next/link';
import { Service } from '@/types';
import { Star, Clock, RefreshCw, MapPin, Heart, Briefcase } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ServiceCardProps {
  service: Service;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export default function ServiceCard({ service, onFavorite, isFavorited }: ServiceCardProps) {
  const primaryImage = service.images?.find(i => i.isPrimary)?.url || service.images?.[0]?.url;

  return (
    <div className="card group overflow-hidden">
      {/* Image */}
      <Link href={`/services/${service.id}`}>
        <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 gradient-primary">
              <Briefcase size={48} className="text-white/40" />
            </div>
          )}

          {/* Category Badge */}
          {service.category && (
            <span className="absolute top-3 left-3 badge badge-accent text-[10px] shadow-sm">
              {service.category.name}
            </span>
          )}

          {/* Featured */}
          {service.isFeatured && (
            <span className="absolute top-3 right-3 badge bg-white/90 text-[#007261] text-[10px]">⭐ Pro</span>
          )}

          {/* Favorite */}
          <button
            onClick={(e) => { e.preventDefault(); onFavorite?.(service.id); }}
            className={`absolute bottom-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-md ${
              isFavorited
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-500 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100'
            }`}
          >
            <Heart size={14} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>

          {/* Unavailable overlay */}
          {!service.isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="badge badge-gray text-xs">Unavailable</span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Provider info */}
        {service.provider?.profile && (
          <div className="flex items-center gap-2 mb-3">
            {service.provider.profile.avatarUrl ? (
              <img src={service.provider.profile.avatarUrl} className="avatar avatar-xs" alt="provider" />
            ) : (
              <div className="avatar avatar-xs gradient-primary text-white text-[9px]">
                {service.provider.profile.fullName?.charAt(0)}
              </div>
            )}
            <span className="text-xs font-medium text-gray-600">{service.provider.profile.fullName}</span>
            {service.provider.profile.isVerified && (
              <span className="w-4 h-4 rounded-full bg-[#007261] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[8px]">✓</span>
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <Link href={`/services/${service.id}`}>
          <h3 className="font-semibold text-[14px] mb-2 line-clamp-2 hover:text-[#007261] transition-colors leading-snug">
            {service.title}
          </h3>
        </Link>

        {/* Rating */}
        {service._count && service._count.reviews > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={11} fill={s <= 4 ? '#F59E0B' : 'none'} className="text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-medium">4.8</span>
            <span className="text-xs text-gray-400">({service._count.reviews} reviews)</span>
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Clock size={11} /> {service.deliveryDays}d delivery
          </span>
          <span className="flex items-center gap-1">
            <RefreshCw size={11} /> {service.revisions} revisions
          </span>
          {service.city && (
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {service.city}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div>
            <p className="text-xs text-gray-400">Starting at</p>
            <p className="font-bold text-lg text-[#007261]">{formatPrice(service.price)}</p>
          </div>
          <Link href={`/services/${service.id}`} className="btn btn-primary btn-sm">
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
