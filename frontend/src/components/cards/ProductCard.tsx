import Link from 'next/link';
import { Product } from '@/types';
import { Star, MapPin, Heart, Eye, Tag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export default function ProductCard({ product, onFavorite, isFavorited }: ProductCardProps) {
  const primaryImage = product.images?.find(i => i.isPrimary)?.url || product.images?.[0]?.url;
  const discountPct = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  return (
    <div className="card group overflow-hidden">
      {/* Image */}
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Tag size={48} />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isFeatured && (
              <span className="badge badge-accent text-[10px] shadow-sm">⭐ Featured</span>
            )}
            {discountPct && (
              <span className="badge badge-red text-[10px]">-{discountPct}%</span>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={(e) => { e.preventDefault(); onFavorite?.(product.id); }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-md ${
              isFavorited
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-500 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100'
            }`}
            aria-label="Toggle favorite"
          >
            <Heart size={15} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <span className="text-[11px] font-medium text-[#007261] bg-[#e6f4f1] px-2 py-0.5 rounded-md">
            {product.category.name}
          </span>
        )}

        {/* Title */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-[15px] mt-2 mb-1 line-clamp-2 hover:text-[#007261] transition-colors leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* Location & Views */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          {product.city && (
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {product.city}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye size={11} /> {product.viewsCount}
          </span>
        </div>

        {/* Rating */}
        {product._count && product._count.reviews > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Star size={12} fill="#F59E0B" className="text-amber-400" />
            <span className="text-xs font-medium">4.5</span>
            <span className="text-xs text-gray-400">({product._count.reviews})</span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-lg text-[#007261]">
              {formatPrice(product.discountPrice || product.price)}
            </p>
            {product.discountPrice && (
              <p className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</p>
            )}
          </div>

          <Link
            href={`/products/${product.id}`}
            className="btn btn-primary btn-sm"
          >
            View
          </Link>
        </div>

        {/* Seller */}
        {product.seller?.profile && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            {product.seller.profile.avatarUrl ? (
              <img src={product.seller.profile.avatarUrl} className="avatar avatar-xs" alt="seller" />
            ) : (
              <div className="avatar avatar-xs gradient-primary text-white text-[9px]">
                {product.seller.profile.fullName?.charAt(0)}
              </div>
            )}
            <span className="text-xs text-gray-500 truncate">{product.seller.profile.fullName}</span>
            {product.stock <= 3 && product.stock > 0 && (
              <span className="ml-auto text-[10px] badge badge-yellow">Only {product.stock} left</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
