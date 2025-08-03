# Cinco Apartments Billing System

A comprehensive internal billing system for Cinco Apartments, built with Next.js and Tailwind CSS. This single-page application manages multiple sites (Laguna and Pidanna) and provides complete billing functionality with receipt generation and analytics.

## Features

### 🔧 Input Sections
- **Basic Information**: Site name, unit, tenant name, billing month/year
- **Electricity Billing**: Previous/current readings, price per kWh, auto-calculation, meter photo upload
- **Water Billing**: Tiered billing system with customizable rates, meter photo upload
- **Rent and Fees**: Base rent, parking fees, damage descriptions, other charges

### 🧾 Receipt Generation
- Live preview of billing statement
- Complete breakdown of all charges
- Meter photo integration
- Export as PDF or Image with one click
- Professional receipt formatting

### 📊 Analytics
- Monthly electricity consumption charts
- Monthly water usage visualization
- Responsive chart displays

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **PDF Generation**: jsPDF + html2canvas
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd apartment-receipt
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Basic Workflow

1. **Enter Basic Information**
   - Fill in site name (Laguna/Pidanna)
   - Enter unit number
   - Add tenant name
   - Select billing month and year

2. **Electricity Billing**
   - Input previous and current meter readings
   - Set price per kWh (default: ₱12.50)
   - Upload meter photo (optional)
   - View auto-calculated consumption and total

3. **Water Billing**
   - Input previous and current meter readings
   - Configure tiered rates:
     - First 10 m³: Flat fee
     - 11-20 m³: Per m³ rate
     - 21-30 m³: Per m³ rate
     - Above 30 m³: Per m³ rate
   - Upload meter photo (optional)

4. **Rent and Fees**
   - Set base rent amount
   - Enable/disable parking fee
   - Add damage descriptions
   - Include other fees

5. **Export Receipt**
   - Review live preview
   - Click "Export PDF" or "Export Image"
   - Download automatically named file

### Water Billing Tier System

The water billing uses a tiered system:
- **First 10 m³**: Flat fee (₱150 default)
- **11-20 m³**: ₱25 per m³
- **21-30 m³**: ₱30 per m³  
- **Above 30 m³**: ₱35 per m³

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Manual Build

```bash
npm run build
npm start
```

## File Structure

```
apartment-receipt/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main application
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Customization

### Water Rates
Edit the default water rates in `app/page.tsx`:
```typescript
waterRates: {
  first10: 150,    // First 10 m³ flat fee
  next10: 25,      // 11-20 m³ per m³ rate
  next10: 30,      // 21-30 m³ per m³ rate  
  above30: 35      // Above 30 m³ per m³ rate
}
```

### Electricity Price
Change the default electricity price:
```typescript
electricityPricePerKwh: 12.5  // Default price per kWh
```

### Analytics Data
Replace the sample data in the analytics section with real data from your database.

## Features in Detail

### Mobile Responsive
- Fully responsive design
- Optimized for mobile devices
- Touch-friendly interface

### Export Options
- **PDF Export**: High-quality PDF with proper formatting
- **Image Export**: PNG format for easy sharing
- Automatic file naming based on billing data

### Real-time Calculations
- Instant electricity bill calculation
- Tiered water bill computation
- Live total updates
- Receipt preview updates

### Photo Integration
- Upload meter photos for both electricity and water
- Photos included in receipt exports
- Preview thumbnails in the interface

## Support

For internal use only. Contact the development team for any issues or feature requests.

## License

Internal use only - Cinco Apartments 