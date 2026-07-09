import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.model';
import Category from './models/Category.model';
import Product from './models/Product.model';
import Service from './models/Service.model';

const MONGODB_URI = process.env.MONGODB_URI;

async function main() {
  if (!MONGODB_URI) {
    throw new Error('❌ MONGODB_URI is not defined in .env');
  }

  console.log('🌱 Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('🌱 Seeding database...');

  // Clear existing data
  await User.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Service.deleteMany({});
  console.log('🗑️ Cleared existing database records.');

  // ── Categories ────────────────────────────────────────────────
  const categoriesData = [
    { name: 'Electronics', slug: 'electronics', description: 'Phones, laptops, gadgets', iconUrl: '💻' },
    { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes, accessories', iconUrl: '👗' },
    { name: 'Home & Garden', slug: 'home-garden', description: 'Furniture, decor, tools', iconUrl: '🏡' },
    { name: 'Sports', slug: 'sports', description: 'Fitness equipment, outdoor gear', iconUrl: '⚽' },
    { name: 'Web Development', slug: 'web-development', description: 'Websites, apps, APIs', iconUrl: '🌐' },
    { name: 'Graphic Design', slug: 'graphic-design', description: 'Logos, branding, UI/UX', iconUrl: '🎨' },
    { name: 'Writing & Translation', slug: 'writing-translation', description: 'Content, copywriting, translation', iconUrl: '✍️' },
    { name: 'Photography', slug: 'photography', description: 'Event, portrait, product shoots', iconUrl: '📸' },
    { name: 'Marketing', slug: 'marketing', description: 'SEO, social media, ads', iconUrl: '📈' },
    { name: 'Tutoring', slug: 'tutoring', description: 'Academic and skill tutoring', iconUrl: '📚' },
  ];

  const categoriesMap: Record<string, any> = {};
  for (const cat of categoriesData) {
    const doc = await Category.create(cat);
    categoriesMap[cat.slug] = doc;
  }
  console.log('✅ Created categories.');

  // ── Super Admin ───────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@12345', 12);
  await User.create({
    email: 'admin@localhub.com',
    username: 'superadmin',
    passwordHash: adminHash,
    role: 'SUPER_ADMIN',
    isEmailVerified: true,
    profile: {
      fullName: 'Super Admin',
      isVerified: true,
      averageRating: 0,
      totalSales: 0,
      completedServices: 0,
      totalReviews: 0,
      skills: [],
      portfolioLinks: []
    },
  });

  // ── Demo Seller ───────────────────────────────────────────────
  const sellerHash = await bcrypt.hash('Seller@12345', 12);
  const seller = await User.create({
    email: 'seller@localhub.com',
    username: 'johnseller',
    passwordHash: sellerHash,
    role: 'SELLER',
    isEmailVerified: true,
    profile: {
      fullName: 'John Seller',
      bio: 'Premium electronics seller with 5+ years experience',
      city: 'Karachi',
      country: 'Pakistan',
      isVerified: true,
      averageRating: 4.7,
      totalSales: 142,
      completedServices: 0,
      totalReviews: 0,
      skills: [],
      portfolioLinks: []
    },
  });

  // ── Demo Service Provider ─────────────────────────────────────
  const provHash = await bcrypt.hash('Provider@12345', 12);
  const provider = await User.create({
    email: 'provider@localhub.com',
    username: 'sarahdev',
    passwordHash: provHash,
    role: 'SERVICE_PROVIDER',
    isEmailVerified: true,
    profile: {
      fullName: 'Sarah Developer',
      bio: 'Full-stack web developer specializing in React & Node.js',
      city: 'Lahore',
      country: 'Pakistan',
      isVerified: true,
      averageRating: 4.9,
      completedServices: 87,
      totalSales: 0,
      totalReviews: 0,
      skills: [],
      portfolioLinks: []
    },
  });

  // ── Demo User ─────────────────────────────────────────────────
  const userHash = await bcrypt.hash('User@12345', 12);
  await User.create({
    email: 'user@localhub.com',
    username: 'testuser',
    passwordHash: userHash,
    role: 'USER',
    isEmailVerified: true,
    profile: {
      fullName: 'Test User',
      city: 'Islamabad',
      country: 'Pakistan',
      isVerified: false,
      averageRating: 0,
      totalSales: 0,
      completedServices: 0,
      totalReviews: 0,
      skills: [],
      portfolioLinks: []
    },
  });
  console.log('✅ Created users (Super Admin, Seller, Provider, Buyer).');

  const electronics = categoriesMap['electronics'];
  const fashion = categoriesMap['fashion'];
  const homeGarden = categoriesMap['home-garden'];
  const webDev = categoriesMap['web-development'];
  const graphicDesign = categoriesMap['graphic-design'];
  const marketing = categoriesMap['marketing'];

  // ── Demo Products ─────────────────────────────────────────────
  await Product.create([
    {
      sellerId: seller._id,
      categoryId: electronics?._id,
      title: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24-ultra-seed',
      description: 'Latest flagship with 200MP camera, S-Pen, and 12GB RAM. Brand new sealed box with 1-year warranty.',
      price: 180000,
      discountPrice: 175000,
      stock: 5,
      tags: ['samsung', 'smartphone', '5g', 'flagship'],
      city: 'Karachi',
      status: 'ACTIVE',
      isFeatured: true,
      images: [{
        url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        order: 0
      }]
    },
    {
      sellerId: seller._id,
      categoryId: electronics?._id,
      title: 'MacBook Pro M3 14"',
      slug: 'macbook-pro-m3-14-seed',
      description: 'Apple MacBook Pro M3 chip, 16GB RAM, 512GB SSD. Perfect for developers and creators.',
      price: 380000,
      stock: 3,
      tags: ['apple', 'laptop', 'macbook', 'm3'],
      city: 'Karachi',
      status: 'ACTIVE',
      isFeatured: true,
      images: [{
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        order: 0
      }]
    },
    {
      sellerId: seller._id,
      categoryId: electronics?._id,
      title: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max-seed',
      description: 'Titanium design with A17 Pro chip, 256GB SSD, and 5x Telephoto camera. Brand new sealed package.',
      price: 310000,
      discountPrice: 295000,
      stock: 8,
      tags: ['apple', 'iphone', 'ios', 'smartphone'],
      city: 'Karachi',
      status: 'ACTIVE',
      isFeatured: true,
      images: [{
        url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        order: 0
      }]
    },
    {
      sellerId: seller._id,
      categoryId: electronics?._id,
      title: 'Sony WH-1000XM5 Headphones',
      slug: 'sony-wh-1000xm5-seed',
      description: 'Industry-leading noise-canceling wireless overhead headphones with 30-hour battery life.',
      price: 85000,
      stock: 12,
      tags: ['sony', 'headphones', 'audio', 'wireless'],
      city: 'Karachi',
      status: 'ACTIVE',
      isFeatured: false,
      images: [{
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        order: 0
      }]
    },
    {
      sellerId: seller._id,
      categoryId: fashion?._id,
      title: 'Premium Leather Jacket',
      slug: 'premium-leather-jacket-seed',
      description: 'Handcrafted sheepskin leather jacket with high-quality metal zippers and comfortable lining.',
      price: 15000,
      stock: 10,
      tags: ['jacket', 'leather', 'fashion', 'outerwear'],
      city: 'Lahore',
      status: 'ACTIVE',
      isFeatured: true,
      images: [{
        url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        order: 0
      }]
    },
    {
      sellerId: seller._id,
      categoryId: homeGarden?._id,
      title: 'Ergonomic Office Chair',
      slug: 'ergonomic-office-chair-seed',
      description: 'Mesh desk chair with adjustable lumbar support, 3D armrests, and high-density foam cushion.',
      price: 24500,
      stock: 15,
      tags: ['chair', 'furniture', 'office', 'ergonomic'],
      city: 'Islamabad',
      status: 'ACTIVE',
      isFeatured: true,
      images: [{
        url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        order: 0
      }]
    },
    {
      sellerId: seller._id,
      categoryId: electronics?._id,
      title: 'Mechanical Keyboard (Red Switches)',
      slug: 'mechanical-keyboard-red-switches-seed',
      description: 'Hot-swappable tenkeyless mechanical gaming keyboard with RGB backlighting and linear red switches.',
      price: 12000,
      stock: 20,
      tags: ['keyboard', 'gaming', 'mechanical', 'rgb'],
      city: 'Karachi',
      status: 'ACTIVE',
      isFeatured: false,
      images: [{
        url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        order: 0
      }]
    },
    {
      sellerId: seller._id,
      categoryId: fashion?._id,
      title: 'Nike Air Max Sneakers',
      slug: 'nike-air-max-sneakers-seed',
      description: 'Comfortable running and casual shoes featuring transparent air cushions and durable grip sole.',
      price: 22000,
      stock: 6,
      tags: ['nike', 'shoes', 'sneakers', 'fashion'],
      city: 'Lahore',
      status: 'ACTIVE',
      isFeatured: false,
      images: [{
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        order: 0
      }]
    }
  ]);
  console.log('✅ Created demo products.');

  // ── Demo Services ──────────────────────────────────────────────
  await Service.create([
    {
      providerId: provider._id,
      categoryId: webDev?._id,
      title: 'Full-Stack Web Application Development',
      slug: 'fullstack-web-development-seed',
      description: 'I will build a complete web application using React, Node.js, and MongoDB with modern UI design.',
      price: 25000,
      deliveryDays: 14,
      revisions: 3,
      tags: ['react', 'nodejs', 'fullstack', 'web'],
      city: 'Lahore',
      status: 'ACTIVE',
      isFeatured: true,
      packages: [
        { name: 'Basic', description: 'Simple landing page', price: 8000, deliveryDays: 5 },
        { name: 'Standard', description: 'Full web app with backend', price: 25000, deliveryDays: 14 },
        { name: 'Premium', description: 'Complete SaaS with auth & payments', price: 60000, deliveryDays: 30 },
      ],
      images: [{
        url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        order: 0
      }]
    },
    {
      providerId: provider._id,
      categoryId: graphicDesign?._id,
      title: 'Logo Design & Brand Identity',
      slug: 'logo-design-brand-identity-seed',
      description: 'Professional vector logo design along with comprehensive brand identity kit and typography standards.',
      price: 5000,
      deliveryDays: 5,
      revisions: 5,
      tags: ['logo', 'branding', 'graphic-design', 'illustrator'],
      city: 'Lahore',
      status: 'ACTIVE',
      isFeatured: true,
      packages: [
        { name: 'Basic', description: '1 Concept Logo with transparent PNG', price: 3000, deliveryDays: 3 },
        { name: 'Standard', description: '3 Concepts with source files & vector format', price: 5000, deliveryDays: 5 },
        { name: 'Premium', description: 'Full branding kit with stationary & social layouts', price: 15000, deliveryDays: 10 },
      ],
      images: [{
        url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        order: 0
      }]
    },
    {
      providerId: provider._id,
      categoryId: marketing?._id,
      title: 'Professional SEO Optimization',
      slug: 'professional-seo-optimization-seed',
      description: 'Audit and optimization for search engine optimization including on-page SEO, speed, and keyword strategy.',
      price: 15000,
      deliveryDays: 10,
      revisions: 2,
      tags: ['seo', 'google', 'marketing', 'ranking'],
      city: 'Karachi',
      status: 'ACTIVE',
      isFeatured: true,
      packages: [
        { name: 'Basic', description: 'On-page audit & report', price: 6000, deliveryDays: 4 },
        { name: 'Standard', description: 'SEO optimization for 5 main pages', price: 15000, deliveryDays: 10 },
        { name: 'Premium', description: 'Full SEO campaign & competitor analysis', price: 35000, deliveryDays: 20 },
      ],
      images: [{
        url: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        order: 0
      }]
    },
    {
      providerId: provider._id,
      categoryId: marketing?._id,
      title: 'Social Media Management',
      slug: 'social-media-management-seed',
      description: 'Create high-engagement posts and manage Facebook, Instagram, and LinkedIn growth strategy.',
      price: 20000,
      deliveryDays: 30,
      revisions: 4,
      tags: ['social-media', 'instagram', 'facebook', 'management'],
      city: 'Islamabad',
      status: 'ACTIVE',
      isFeatured: false,
      packages: [
        { name: 'Basic', description: '10 Posts per month, content creation only', price: 10000, deliveryDays: 15 },
        { name: 'Standard', description: '20 Posts per month with basic strategy & tags', price: 20000, deliveryDays: 30 },
        { name: 'Premium', description: 'Daily posts, ad setup, and monthly growth report', price: 40000, deliveryDays: 30 },
      ],
      images: [{
        url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        order: 0
      }]
    },
    {
      providerId: provider._id,
      categoryId: graphicDesign?._id,
      title: 'UI/UX Mobile App Design',
      slug: 'uiux-mobile-app-design-seed',
      description: 'Design interactive prototypes for iOS and Android apps using Figma with modern design patterns.',
      price: 30000,
      deliveryDays: 12,
      revisions: 6,
      tags: ['figma', 'uiux', 'app-design', 'prototype'],
      city: 'Lahore',
      status: 'ACTIVE',
      isFeatured: true,
      packages: [
        { name: 'Basic', description: '5 Screens wireframes & basic layout', price: 12000, deliveryDays: 6 },
        { name: 'Standard', description: '10 Screens high fidelity UI & simple prototype', price: 30000, deliveryDays: 12 },
        { name: 'Premium', description: 'Full mobile app design with custom design system', price: 75000, deliveryDays: 25 },
      ],
      images: [{
        url: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        order: 0
      }]
    },
    {
      providerId: provider._id,
      categoryId: webDev?._id,
      title: 'Custom WordPress Website',
      slug: 'custom-wordpress-website-seed',
      description: 'Design and build responsive WordPress websites using Elementor Pro, optimized for security and speed.',
      price: 18000,
      deliveryDays: 7,
      revisions: 4,
      tags: ['wordpress', 'elementor', 'blog', 'website'],
      city: 'Lahore',
      status: 'ACTIVE',
      isFeatured: false,
      packages: [
        { name: 'Basic', description: 'One-page landing page website', price: 8000, deliveryDays: 4 },
        { name: 'Standard', description: '5-page business website with blog section', price: 18000, deliveryDays: 7 },
        { name: 'Premium', description: 'Full WooCommerce e-commerce store', price: 40000, deliveryDays: 14 },
      ],
      images: [{
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        isPrimary: true,
        order: 0
      }]
    }
  ]);
  console.log('✅ Created demo services.');

  console.log('✅ MongoDB Atlas Seed completed successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('  Super Admin: admin@localhub.com / Admin@12345');
  console.log('  Seller:      seller@localhub.com / Seller@12345');
  console.log('  Provider:    provider@localhub.com / Provider@12345');
  console.log('  User:        user@localhub.com / User@12345');
}

main()
  .then(() => mongoose.connection.close())
  .catch((err) => {
    console.error(err);
    mongoose.connection.close();
  });
