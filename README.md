# Worker PWA - Work Order Management App

A Progressive Web App (PWA) designed for field workers to manage work orders with offline capabilities.

## Features

- 📱 **Mobile-First Design**: Optimized for smartphones and tablets
- 🔐 **Worker Authentication**: Secure login with worker selection
- 📋 **Work Order Management**: View assigned and completed work orders
- ✅ **Task Completion**: Complete work orders with notes and photos
- 📸 **Photo Upload**: Before/after photos with automatic compression
- 🔄 **Offline Sync**: Continue working without internet connection
- 💾 **Local Storage**: Data stored locally for offline access
- 🚀 **PWA Features**: Install on device, works like a native app

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Environment Setup

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Demo Login Credentials

- **worker1@example.com** / password123
- **worker2@example.com** / password123
- **worker3@example.com** / password123

## App Structure

```
src/
├── components/           # React components
│   ├── Login.js         # Authentication screen
│   ├── WorkOrderList.js # List of work orders
│   ├── WorkOrderDetails.js # Work order details
│   ├── TaskCompletionForm.js # Task completion form
│   ├── PhotoUpload.js   # Photo upload component
│   ├── Header.js        # App header
│   └── OfflineIndicator.js # Offline status
├── contexts/            # React contexts
│   ├── AuthContext.js   # Authentication state
│   └── OfflineContext.js # Offline status
├── services/            # Business logic
│   ├── apiService.js    # API communication
│   ├── offlineService.js # Offline data management
│   └── syncService.js   # Data synchronization
├── utils/               # Utility functions
│   └── photoUtils.js    # Photo compression
└── App.js               # Main app component
```

## Key Components

### Login Screen
- Worker email/password authentication
- Remember login for offline use
- Demo credentials displayed

### Work Order List
- Filter by status (Active, Completed, All)
- Show work order details and priority
- Offline-first data loading

### Work Order Details
- Complete service information
- Customer contact details
- Start/complete work buttons
- Progress tracking

### Task Completion Form
- Completion status selection
- Required notes field
- Before/after photo upload
- Automatic photo compression

### Photo Upload
- Camera integration
- Multiple photo support
- Automatic compression (1MB max)
- Thumbnail previews
- EXIF data handling

## Offline Capabilities

### Data Persistence
- Work orders cached locally using IndexedDB
- Photos stored as compressed blobs
- Authentication tokens preserved

### Sync Strategy
- Automatic sync when online
- Queue pending uploads for later sync
- Conflict resolution for data changes
- Background sync with service worker

### Offline Features
- View cached work orders
- Complete tasks offline
- Take and store photos
- Update work order status
- Sync automatically when connection restored

## PWA Features

### Service Worker
- Cache static assets
- Offline fallback pages
- Background sync
- Push notification support (future)

### Manifest
- App installation prompt
- Custom app icon and name
- Standalone display mode
- Portrait orientation lock

### Performance
- Asset preloading
- Image compression
- Lazy loading
- Optimized bundle size

## API Integration

The app connects to the Work Order Management API:

### Required Endpoints
- `POST /auth/login` - User authentication
- `GET /workorders` - Fetch work orders
- `GET /workorders/:id` - Get work order details
- `PUT /workorders/:id` - Update work order
- `POST /workorders/:id/complete` - Complete work order
- `POST /upload/photo` - Upload photos

### Data Format
Work orders should include:
```json
{
  "id": "string",
  "workOrderNumber": "string",
  "status": "assigned|in-progress|completed",
  "description": "string",
  "customerName": "string",
  "address": "string",
  "scheduledDate": "ISO string",
  "priority": "low|medium|high"
}
```

## Deployment

### Production Build
```bash
npm run build
```

### Web Server
Serve the `build/` directory with any static web server:
```bash
# Example with serve
npm install -g serve
serve -s build -l 3000
```

### HTTPS Required
PWA features require HTTPS in production. Use a reverse proxy or hosting service that provides SSL certificates.

## Browser Support

- Chrome 60+ (full PWA support)
- Firefox 55+ (limited PWA support)
- Safari 11.1+ (limited PWA support)
- Edge 17+ (full PWA support)

## Development Notes

### Photo Compression
Photos are automatically compressed to:
- Maximum 1MB file size
- Maximum 1920px width/height
- JPEG format with 80% quality
- Web Worker for non-blocking compression

### Offline Storage
- Work orders: IndexedDB
- Photos: IndexedDB blobs
- Auth tokens: LocalStorage
- App cache: Service Worker cache

### Performance Tips
- Images are lazy loaded
- Large datasets are paginated
- Debounced search inputs
- Optimistic UI updates

## Troubleshooting

### Service Worker Issues
Clear browser cache and application data, then refresh.

### Photo Upload Problems
Check camera permissions and file size limits.

### Sync Problems
Verify API connectivity and authentication tokens.

### Installation Issues
Ensure HTTPS and valid manifest.json file.

## Future Enhancements

- Push notifications for new work orders
- GPS location tracking
- Barcode/QR code scanning
- Time tracking and reporting
- Digital signatures
- Voice notes
- Multi-language support