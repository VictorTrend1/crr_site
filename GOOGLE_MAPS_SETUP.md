# Google Maps Setup

## Required Configuration

To use the Google Maps location picker, you need to configure a Google Maps API key.

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Configure Environment Variable

Create a `.env` file in the `site` directory and add:

```
REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 3. Deploy to Vercel

For Vercel deployment, add the environment variable in your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `REACT_APP_GOOGLE_MAPS_API_KEY` with your API key

### 4. Fallback Behavior

If no API key is configured, the component will automatically show a manual input form where users can enter:
- Location name
- Full address
- Latitude and longitude coordinates

This ensures the application works even without Google Maps integration.
