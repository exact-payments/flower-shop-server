import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import 'dotenv/config';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Constants (read from the values in .env file)

const PAYMENT_API_BASE_URL = process.env.PAYMENT_API_BASE_URL || '';
const PAYMENT_PAGE_URL = process.env.PAYMENT_PAGE_URL || '';
const AUTH_CREDENTIAL_USER = process.env.AUTH_CREDENTIAL_USER || '';
const AUTH_CREDENTIAL_PASSWORD = process.env.AUTH_CREDENTIAL_PASSWORD || '';
const AUTH_CREDENTIALS = Buffer.from(AUTH_CREDENTIAL_USER+':'+AUTH_CREDENTIAL_PASSWORD).toString('base64');
const PARTNER_ID = process.env.PARTNER_ID || '';
const TERMINAL_ID = process.env.TERMINAL_ID || '';
const PYXIS_ACCESS = process.env.PYXIS_ACCESS || '';
const LEGACY_PAYMENT_PAGE = process.env.LEGACY_PAYMENT_PAGE || '';
const ACCEPTED_CARD_LIST = 'VC|VD|MC|MD|DC|DD|AC';

// Types
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface TokenResponse {
  success: boolean;
  data?: {
    token?: string;
    [key: string]: any;
  };
  error?: string;
  [key: string]: any;
}

interface SessionResponse {
  sessionId?: string;
  [key: string]: any;
}

async function getSecurityToken(): Promise<string> {
  
  try {
    console.log(PAYMENT_API_BASE_URL);
    const response = await fetch(`${PAYMENT_API_BASE_URL}/security/getToken`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${AUTH_CREDENTIALS}`,
        'Content-Type': 'application/json',
        'PyxisAccess': PYXIS_ACCESS
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as TokenResponse;
    console.log('Security token response:', data);

    if (!data?.token) {
      throw new Error('Security token not found in response');
    }

    return data.token;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get security token: ${error.message}`);
    }
    throw new Error('Failed to get security token: Unknown error');
  }
}

async function getSessionToken(securityToken: string): Promise<SessionResponse> {
  try {
    const response = await fetch(
      `${PAYMENT_PAGE_URL}/payPage-initialize?SessionType=sale&TerminalId=${TERMINAL_ID}`, 
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${securityToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as SessionResponse;
    console.log('Session token response:', data);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get session token: ${error.message}`);
    }
    throw new Error('Failed to get session token: Unknown error');
  }
}

// Update the /pay route to include the final URL construction
// Add this function for the final payment page call
async function initiatePaymentPage(sessionId: string, total: number): Promise<any> {
    const url = LEGACY_PAYMENT_PAGE === 'true' 
    ? new URL(`${PAYMENT_PAGE_URL}/JfsPyxisPayPage.jsp`)
    : new URL(`${PAYMENT_PAGE_URL}/pay`);
  console.log('URL:');
  console.log(url.toString());
    try {
    url.searchParams.append('SaleTotal', (total*100).toString());
    url.searchParams.append('PayPageSessionId', sessionId);
    url.searchParams.append('PartnerId', PARTNER_ID);
    url.searchParams.append('TerminalId', TERMINAL_ID);
    url.searchParams.append('AcceptedCardList', ACCEPTED_CARD_LIST);
    url.searchParams.append('AllowEFTAccountsFlag', 'true');
    url.searchParams.append('LocalSubmitFlag', 'true');
    url.searchParams.append('CCardCvvFlag', 'true');
    console.log('URL:');
    console.log(url.toString())
    const response = await fetch(
    url.toString(), 
        {
            method: 'POST', 
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'text/html'
            }
        }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text(); // The response might be HTML content
    console.log('Payment page response received');
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to initiate payment page: ${error.message}`);
    }
    throw new Error('Failed to initiate payment page: Unknown error');
  }
}

// Route to initiate payment

app.post('/pay', async (req, res) => {
  try {
    const { items, total } = req.body;
    
    console.log('Received payment request:', { items, total });

    try {
      // Step 1: Get security token
      const securityToken = await getSecurityToken();
      console.log('Successfully obtained security token');

      // Step 2: Get session Id using the security token
      const sessionResponse = await getSessionToken(securityToken);
      console.log('Successfully obtained session token');

      if (!sessionResponse?.sessionId) {
        throw new Error('Session ID not received in response');
      }

      // Step 3: Make POST call to payment page
      const paymentPageResponse = await initiatePaymentPage(sessionResponse.sessionId, total);

      // Return the payment page content to client
      res.json({
        success: true,
        message: 'Payment initiated',
        paymentContent: paymentPageResponse
      });
      
    } catch (error) {
      console.error('Failed in payment process:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initiate payment process'
      });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment request'
    });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});