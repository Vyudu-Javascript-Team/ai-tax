# Alternative Deployment Guide for AI Tax Preparation Platform

This guide provides instructions for deploying the AI Tax Preparation Platform on a traditional web server or cloud platform.

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Git
- PostgreSQL database
- Web server (e.g., Nginx or Apache)
- SSL certificate for HTTPS

## Deployment Steps

1. Clone the repository on your server:
   ```
   git clone https://github.com/your-repo/ai-tax-prep-platform.git
   cd ai-tax-prep-platform
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy the `.env.example` file to `.env`
   - Fill in all the required values in `.env`

4. Build the application:
   ```
   npm run build
   ```

5. Set up the database:
   - Create a PostgreSQL database
   - Update the `DATABASE_URL` in `.env` with your database connection string
   - Run database migrations:
     ```
     npx prisma migrate deploy
     ```

6. Start the application:
   ```
   npm start
   ```

7. Set up a reverse proxy:
   - Configure Nginx or Apache to proxy requests to your Node.js application
   - Example Nginx configuration:
     ```nginx
     server {
         listen 80;
         server_name yourdomain.com;
         
         location / {
             proxy_pass http://localhost:3000;
             proxy_http_version 1.1;
             proxy_set_header Upgrade $http_upgrade;
             proxy_set_header Connection 'upgrade';
             proxy_set_header Host $host;
             proxy_cache_bypass $http_upgrade;
         }
     }
     ```

8. Set up SSL:
   - Obtain an SSL certificate (e.g., using Let's Encrypt)
   - Configure your web server to use HTTPS

9. Set up cron jobs for scheduled tasks:
   - Add the following to your server's crontab:
     ```
     0 0 * * * curl https://yourdomain.com/api/cron/check-trial-end
     0 12 * * * curl https://yourdomain.com/api/cron/send-trial-reminders
     0 1 * * * curl https://yourdomain.com/api/cron/update-tax-library
     ```

## Keeping the Application Running

To keep the Node.js application running after you close the terminal, you can use a process manager like PM2:

1. Install PM2 globally:
   ```
   npm install -g pm2
   ```

2. Start the application with PM2:
   ```
   pm2 start npm --name "ai-tax-prep" -- start
   ```

3. Set up PM2 to start on system boot:
   ```
   pm2 startup
   pm2 save
   ```

## Updating the Application

1. Pull the latest changes from the repository:
   ```
   git pull origin main
   ```

2. Install any new dependencies:
   ```
   npm install
   ```

3. Run database migrations:
   ```
   npx prisma migrate deploy
   ```

4. Rebuild the application:
   ```
   npm run build
   ```

5. Restart the application:
   ```
   pm2 restart ai-tax-prep
   ```

## Monitoring and Logging

- Use PM2's built-in monitoring: `pm2 monit`
- Check application logs: `pm2 logs ai-tax-prep`
- For more advanced monitoring, consider setting up tools like Prometheus and Grafana

Remember to follow best practices for server security, such as setting up a firewall, keeping your system updated, and regularly backing up your database.

For more detailed information on specific features and their implementation, refer to the `docs/comprehensive-feature-guide.md` file.