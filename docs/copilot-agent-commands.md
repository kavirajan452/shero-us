# 🤖 Shero US — Phase 1 Copilot Agent Commands

> Paste each command block directly into GitHub Copilot Agent (chat or agent mode).
> Complete tasks in order — later tasks depend on earlier ones.
> Each command is self-contained and specifies the exact file(s) to modify or create.

---

## Phase 1.1 — Real Phone OTP Authentication

---

### Command 1.1.1 — Create `send-otp` Edge Function

```
Create the file supabase/functions/send-otp/index.ts as a Supabase Edge Function
written in Deno/TypeScript.

The function must:
- Accept HTTP POST with JSON body { phone: string }
- Validate that phone is a non-empty string
- Call the Twilio Verify API: POST https://verify.twilio.com/v2/Services/{TWILIO_VERIFY_SID}/Verifications
  with body { To: phone, Channel: "sms" }
- Use HTTP Basic Auth with TWILIO_ACCOUNT_SID:TWILIO_AUTH_TOKEN from Deno.env
- Return HTTP 200 { success: true } on success
- Return HTTP 400 { success: false, error: "..." } on validation failure
- Return HTTP 500 { success: false, error: "..." } on Twilio error
- Set CORS headers to allow requests from any origin
```

---

### Command 1.1.2 — Create `verify-otp` Edge Function

```
Create the file supabase/functions/verify-otp/index.ts as a Supabase Edge Function
written in Deno/TypeScript.

The function must:
- Accept HTTP POST with JSON body { phone: string, code: string }
- Call the Twilio Verify check API: POST https://verify.twilio.com/v2/Services/{TWILIO_VERIFY_SID}/VerificationCheck
  with body { To: phone, Code: code }
- Use HTTP Basic Auth with TWILIO_ACCOUNT_SID:TWILIO_AUTH_TOKEN from Deno.env
- If Twilio returns status "approved":
  - Use the Supabase service role client (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from Deno.env)
  - Sign in or create the user via supabase.auth.admin.generateLink({ type: "magiclink", email: phone + "@shero.us" })
  - Return HTTP 200 { success: true, accessToken: "...", user: { id, phone } }
- If Twilio returns status "pending" or "canceled":
  - Return HTTP 401 { success: false, error: "Invalid OTP" }
- Return HTTP 500 on any other error
- Set CORS headers to allow requests from any origin
```

---

### Command 1.1.3 — Wire real OTP into Auth.tsx

```
In src/pages/Auth.tsx, make the following changes:

1. Find the handleSendOtp function. It currently constructs a fake email from the phone
   number and calls supabase.auth.signInWithOtp or similar. Replace the entire function body
   to instead call fetch('/functions/v1/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: loginPhone }) }).
   On success response, call setShowOtpInput(true) and show a success toast "OTP sent to {phone}".
   On error response or fetch failure, show an error toast with the error message.

2. Find the handleVerifyOtp function. It currently checks the OTP against a hardcoded value
   DEV_OTP = "123456". Replace the entire function body to instead call
   fetch('/functions/v1/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: loginPhone, code: otp }) }).
   On success response, store the returned accessToken using supabase.auth.setSession or the
   existing auth context and navigate to the intended page.
   On error, show an error toast.

3. Remove the constant DEV_OTP = "123456" and any comment that references it.

4. Do not change any UI markup, styling, or other logic in the file.
```

---

### Command 1.1.4 — Verify and add new-user profile trigger

```
Check the files in supabase/migrations/ for a migration that creates a trigger named
handle_new_user (or similar) on auth.users that auto-inserts a row into the public.profiles
table and a row into public.user_roles with role = 'customer' on every new signup.

If that migration does not exist, create the file
supabase/migrations/20240001000000_add_handle_new_user_trigger.sql with the following:

- A function handle_new_user() that inserts into public.profiles (id = NEW.id, phone = NEW.phone,
  created_at = now()) and inserts into public.user_roles (user_id = NEW.id, role = 'customer')
  using ON CONFLICT DO NOTHING for both.
- A trigger AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user()

If the migration already exists, make no changes and report what was found.
```

---

### Command 1.1.5 — Create RequireAuth wrapper component

```
Create the file src/components/RequireAuth.tsx.

The component must:
- Accept children as props
- Read the current auth session from the existing useAuth() hook
  (or supabase.auth.getSession if useAuth is not available)
- If the user is not authenticated (session is null), redirect to
  /auth?next={encodeURIComponent(window.location.pathname + window.location.search)}
  using useNavigate from react-router-dom
- If the user is authenticated, render children

Then open src/App.tsx (or wherever the routes are defined) and wrap the following routes
in the RequireAuth component:
- /checkout
- /customer
- /referrals

Do not wrap any other routes.
```

---

### Command 1.1.6 — Add OTP rate limiting

```
In supabase/functions/send-otp/index.ts, add rate limiting before calling the Twilio API.

Add the following logic at the start of the request handler:
1. Create a Supabase client using SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from Deno.env
2. Query the table otp_attempts for rows where phone = requestBody.phone
   AND created_at > NOW() - INTERVAL '1 hour'
3. If the count is 3 or more, return HTTP 429 { success: false, error: "Too many OTP requests. Try again in 1 hour." }
4. Otherwise, insert a new row into otp_attempts { phone, created_at: now() } before calling Twilio

Also create the migration file supabase/migrations/20240001000001_add_otp_attempts.sql with:
CREATE TABLE otp_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX otp_attempts_phone_idx ON otp_attempts(phone, created_at);
```

---

## Phase 1.2 — Kitchen Discovery & Geo-filter

---

### Command 1.2.1 — Create `get_nearby_kitchens` SQL function

```
Create the migration file supabase/migrations/20240002000000_add_get_nearby_kitchens_rpc.sql

The migration must create a PostgreSQL function with this exact signature:
  get_nearby_kitchens(customer_lat float, customer_lng float, radius_km float)

The function must:
- Return all columns from kitchen_partners plus a computed column distance_km (float)
- Calculate distance_km using the haversine formula:
  6371 * acos(LEAST(1, cos(radians(customer_lat)) * cos(radians(latitude))
  * cos(radians(longitude) - radians(customer_lng))
  + sin(radians(customer_lat)) * sin(radians(latitude))))
- Filter to rows where is_active = TRUE and latitude IS NOT NULL and longitude IS NOT NULL
- Filter to rows where the computed distance_km <= radius_km (use HAVING or a subquery)
- Order results by distance_km ASC
- Mark the function as LANGUAGE SQL STABLE

Use CREATE OR REPLACE FUNCTION.
```

---

### Command 1.2.2 — Update `useNearbyKitchenPartners` to use RPC

```
Open src/hooks/useSupabaseData.ts and find the hook or query named useNearbyKitchenPartners
(or the query that fetches kitchen_partners for the nearby kitchens feature).

Make the following changes:
1. Replace the current fetch-all-then-filter approach with a call to
   supabase.rpc('get_nearby_kitchens', { customer_lat, customer_lng, radius_km })
2. The radius_km value should come from the existing useKitchenVisibilityRadius hook
   (or the app_config table value) if available, otherwise default to 7
3. Remove any client-side haversine distance calculation loop that was previously used
   to filter the results
4. Keep the same return shape and TypeScript types as before so no other files need to change
```

---

### Command 1.2.3 — Add ZIP-code fallback to InstantDelivery.tsx

```
Open src/pages/InstantDelivery.tsx.

When the browser geolocation permission is denied (locationStatus === "denied" or equivalent),
the page currently shows an error or empty state. Change it to:

1. Render a ZIP code input field with a "Find kitchens" button
2. On submit, call the existing useServiceability hook's checkByZip(zip) function
   (found in src/hooks/useServiceability.ts)
3. If the ZIP is serviceable, query kitchens by filtering on
   kitchen_partner_locations.pincode matching the entered ZIP
   (use supabase.from('kitchen_partner_locations').select('kitchen_id').eq('pincode', zip)
   then fetch those kitchen_partners)
4. If the ZIP is not serviceable, show the existing "not available in your area" message

Use the existing Tailwind CSS classes and UI components (Input, Button from shadcn/ui)
that are already used in the file. Do not add new dependencies.
```

---

### Command 1.2.4 — Verify real-time attendance badge

```
Open src/pages/InstantDelivery.tsx and src/hooks/useSupabaseData.ts.

Verify that there is a Supabase Realtime subscription active on the kitchen_partners table
that updates the local kitchen list state when any row changes (specifically the
is_attendance_marked column).

If the subscription exists but is not triggering a re-render of the live/closed badge,
fix the issue so that:
- The badge re-renders within 2 seconds of is_attendance_marked changing in the database
- The subscription is correctly unsubscribed when the component unmounts

If no subscription exists, add one using supabase.channel('kitchen-attendance')
.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'kitchen_partners' }, handler)
.subscribe() in the relevant hook or component.
```

---

## Phase 1.3 — Cart Persistence

---

### Command 1.3.1 — Add localStorage persistence to CartContext

```
Open src/contexts/CartContext.tsx.

Add the following behavior to the CartProvider component:

1. On component mount, read the key "shero_cart" from localStorage.
   Parse the value as JSON and set it as the initial cart items state.
   Wrap the JSON.parse in a try/catch; if parsing fails, start with an empty array.

2. Add a useEffect that runs whenever the items state changes.
   Inside the effect, write localStorage.setItem("shero_cart", JSON.stringify(items)).

Do not change the shape of CartContext, the existing addItem/removeItem/updateQuantity
functions, or any other logic in the file.
```

---

### Command 1.3.2 — Create cart_items migration

```
Create the file supabase/migrations/20240003000000_add_cart_items.sql with:

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES instant_menu_items(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  selected_add_ons JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own cart" ON cart_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_cart_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_cart_items_updated_at();
```

---

### Command 1.3.3 — Sync cart to Supabase for logged-in users

```
Open src/contexts/CartContext.tsx.

Add a useEffect that syncs cart items to the Supabase cart_items table when a user is
logged in. The effect must:

1. Import and call useAuth() (or read the session from supabase.auth.getSession)
   to get the current user's ID
2. Only run the sync when the user is logged in (userId is not null)
3. Debounce the upsert by 500ms using setTimeout/clearTimeout so rapid item changes
   don't cause excessive DB calls
4. Perform a supabase.from('cart_items').upsert(
     items.map(item => ({
       user_id: userId,
       item_id: item.id,
       quantity: item.quantity,
       selected_add_ons: item.selectedAddOns ?? []
     })),
     { onConflict: 'user_id,item_id' }
   ) on the current items array
5. After a successful login event (auth state change to SIGNED_IN), fetch rows from
   cart_items where user_id = userId and merge them into the local cart state,
   taking the higher quantity when both local and remote have the same item_id

Clean up the debounce timer in the effect cleanup function.
```

---

## Phase 1.4 — Checkout & Stripe Payment

---

### Command 1.4.1 — Install Stripe packages

```
Run the following command in the project root:

npm install @stripe/stripe-js @stripe/react-stripe-js

After installation, verify that @stripe/stripe-js and @stripe/react-stripe-js appear
in the dependencies section of package.json.
```

---

### Command 1.4.2 — Create `create-payment-intent` Edge Function

```
Create the file supabase/functions/create-payment-intent/index.ts as a Supabase Edge
Function written in Deno/TypeScript.

The function must:
- Accept HTTP POST with JSON body { amount: number, currency: string, orderId: string, customerId: string }
  where amount is in the smallest currency unit (cents for USD)
- Validate that amount > 0 and currency is a non-empty string
- Call the Stripe API: POST https://api.stripe.com/v1/payment_intents
  with application/x-www-form-urlencoded body:
  amount={amount}&currency={currency}&metadata[orderId]={orderId}&metadata[customerId]={customerId}
  using HTTP Bearer auth with STRIPE_SECRET_KEY from Deno.env
- Return HTTP 200 { clientSecret: paymentIntent.client_secret }
- Return HTTP 400 on validation failure
- Return HTTP 500 on Stripe error with the Stripe error message
- Set CORS headers to allow requests from any origin
```

---

### Command 1.4.3 — Create `stripe-webhook` Edge Function

```
Create the file supabase/functions/stripe-webhook/index.ts as a Supabase Edge Function
written in Deno/TypeScript.

The function must:
- Accept HTTP POST from Stripe (no CORS needed)
- Read the raw request body as text and the Stripe-Signature header
- Verify the webhook signature using the Stripe Webhooks Signature verification algorithm
  with STRIPE_WEBHOOK_SECRET from Deno.env. Reject with HTTP 400 if invalid.
- Parse the event object from the raw body
- On event type "payment_intent.succeeded":
  1. Read metadata.orderId from event.data.object
  2. Create a Supabase client with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
  3. Update instant_orders set status = 'accepted', payment_intent_id = event.data.object.id
     where id = orderId
  4. Call the trigger-notification Edge Function via fetch with { orderId, event: 'order_placed' }
- On event type "payment_intent.payment_failed":
  1. Read metadata.orderId from event.data.object
  2. Update instant_orders set status = 'payment_failed' where id = orderId
- Return HTTP 200 { received: true } for all handled events
- Return HTTP 400 for unrecognized events or signature failures
```

---

### Command 1.4.4 — Replace PaymentSection with Stripe Elements

```
Open src/components/PaymentSection.tsx.

Replace the current payment UI (which likely contains mock card input fields or a
fake payment button) with a real Stripe Elements implementation:

1. At the top of the file, import loadStripe from '@stripe/stripe-js' and
   Elements, PaymentElement, useStripe, useElements from '@stripe/react-stripe-js'
2. Create a stripePromise constant outside the component:
   const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
3. The component should accept a prop clientSecret: string and onPaymentSuccess: () => void
4. Wrap the inner payment form in <Elements stripe={stripePromise} options={{ clientSecret }}>
5. Inside the Elements wrapper, render a form containing:
   - <PaymentElement /> (this handles card, Apple Pay, Google Pay automatically)
   - A "Pay" submit button that calls stripe.confirmPayment with
     { elements, confirmParams: { return_url: window.location.origin + '/order-confirmation' } }
   - Show a loading spinner on the button while isLoading is true
   - Show any Stripe error messages (from confirmPayment result.error) below the button
6. Keep all existing Tailwind CSS classes and shadcn/ui Button component for styling

Do not change the props interface for any parent components that use PaymentSection
beyond adding clientSecret and onPaymentSuccess if they are not already there.
```

---

### Command 1.4.5 — Update Checkout.tsx order creation flow

```
Open src/pages/Checkout.tsx.

Change the order creation and payment flow as follows:

1. Find where the order is currently created (likely a call to supabase.from('instant_orders').insert(...)
   or a mutation hook). Change the initial status in the insert payload from whatever it is now
   to 'payment_pending'.

2. After successfully creating the order and receiving the order ID:
   a. Call the create-payment-intent Edge Function:
      fetch('/functions/v1/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
        body: JSON.stringify({ amount: totalInCents, currency: 'usd', orderId: newOrderId, customerId: userId })
      })
   b. Store the returned clientSecret in local state
   c. Show the PaymentSection component with the clientSecret prop

3. The existing fake payment setTimeout or placeholder payment step must be removed entirely.

4. When onPaymentSuccess() is called from PaymentSection, navigate to:
   /order-confirmation?orderId={newOrderId}

5. Keep all existing form validation, address, slot selection, and promo code logic unchanged.
```

---

### Command 1.4.6 — Create AddressAutocomplete component

```
Create the file src/components/AddressAutocomplete.tsx.

The component must:
- Accept props: { value: string, onChange: (result: AddressResult) => void, placeholder?: string }
  where AddressResult = { formattedAddress: string, lat: number, lng: number, zip: string, state: string }
- Use @googlemaps/js-api-loader to lazy-load the Google Maps JS API with the 'places' library
  and VITE_GOOGLE_MAPS_API_KEY from import.meta.env
- Render an <input> element and attach a google.maps.places.Autocomplete instance to it
  with componentRestrictions: { country: 'us' } and fields: ['formatted_address', 'geometry', 'address_components']
- On place_changed event, extract:
  - formattedAddress from place.formatted_address
  - lat and lng from place.geometry.location.lat() and .lng()
  - zip from address_components where types includes 'postal_code'
  - state from address_components where types includes 'administrative_area_level_1' (short_name)
- Call onChange with the extracted AddressResult
- Style the input using Tailwind CSS class: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
- Clean up the Autocomplete listener on component unmount

Then open src/pages/Checkout.tsx and replace the manual street address input field(s)
with <AddressAutocomplete> and wire its onChange to populate the address fields in the
checkout form state.
```

---

### Command 1.4.7 — Wire wallet balance to checkout

```
Open src/pages/Checkout.tsx.

Add a wallet credit toggle to the payment section:

1. Import and call the existing useWallet() hook (from src/contexts/WalletContext.tsx)
   to get the current wallet balance
2. If the user has a wallet balance > 0, display a card or row showing:
   "Use wallet credit: $X.XX available"
   with a Toggle or Switch component (use the existing shadcn/ui Switch component)
3. Track the toggle state in a local boolean useState useWalletCredit
4. When useWalletCredit is true:
   - For the user's first order: cap the wallet discount at 50% of the order total
   - For subsequent orders (check by counting delivered instant_orders for this user): allow 100%
   - Show the discounted total in the order summary
   - Pass the wallet deduction amount to the create-payment-intent call as a reduced amount
5. On successful payment (inside onPaymentSuccess):
   - Call the WalletContext deductBalance(walletAmountUsed, 'order_use', orderId) function
     to insert the debit transaction into wallet_transactions

Do not change the layout or structure of the rest of the checkout page.
```

---

## Phase 1.5 — Notifications

---

### Command 1.5.1 — Create `send-sms` Edge Function

```
Create the file supabase/functions/send-sms/index.ts as a Supabase Edge Function
written in Deno/TypeScript.

The function must:
- Accept HTTP POST with JSON body { to: string, body: string }
- Validate that both fields are non-empty strings
- Call the Twilio Messages API: POST https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json
  with application/x-www-form-urlencoded body: To={to}&From={TWILIO_FROM_NUMBER}&Body={body}
  using HTTP Basic Auth with TWILIO_ACCOUNT_SID:TWILIO_AUTH_TOKEN from Deno.env
- Return HTTP 200 { success: true, sid: message.sid } on success
- Return HTTP 400 on validation failure
- Return HTTP 500 on Twilio error with the error message
- Set CORS headers to allow requests from any origin
```

---

### Command 1.5.2 — Create `send-order-email` Edge Function

```
Create the file supabase/functions/send-order-email/index.ts as a Supabase Edge Function
written in Deno/TypeScript.

The function must:
- Accept HTTP POST with JSON body { to: string, templateId: string, dynamicData: object }
- Call the SendGrid API: POST https://api.sendgrid.com/v3/mail/send
  with Authorization: Bearer {SENDGRID_API_KEY} from Deno.env
  with JSON body:
  {
    "personalizations": [{ "to": [{ "email": to }], "dynamic_template_data": dynamicData }],
    "from": { "email": Deno.env.get("SENDGRID_FROM_EMAIL") },
    "template_id": templateId
  }
- Return HTTP 200 { success: true } on HTTP 202 response from SendGrid
- Return HTTP 400 on validation failure
- Return HTTP 500 on SendGrid error
- Set CORS headers to allow requests from any origin
```

---

### Command 1.5.3 — Create `trigger-notification` Edge Function

```
Create the file supabase/functions/trigger-notification/index.ts as a Supabase Edge
Function written in Deno/TypeScript.

The function must:
- Accept HTTP POST with JSON body { orderId: string, event: string }
  Valid events: order_placed | order_accepted | preparing | out_for_delivery | delivered | cancelled
- Create a Supabase client using SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from Deno.env
- Fetch the order from instant_orders joining profiles (for customer phone/email)
  and kitchen_partners (for partner phone/email) where id = orderId
- Query the communications_templates table for rows matching event and channel
  (if the table does not exist yet, use hardcoded template strings as a fallback)
- For each matched template, replace {{customer_name}}, {{order_id}}, {{total}},
  {{kitchen_name}}, {{eta}} placeholders with real values from the fetched order
- Call the send-sms Edge Function for channel = 'sms' templates (send to customer phone)
- Call the send-order-email Edge Function for channel = 'email' templates (send to customer email)
- For event = 'order_placed' or 'order_accepted', also notify the partner by sending to partner phone
- Return HTTP 200 { success: true, notified: ["customer_sms", "customer_email", ...] }
- Return HTTP 404 if the order is not found
- Return HTTP 500 on any internal error
- Set CORS headers to allow requests from any origin
```

---

### Command 1.5.4 — Create communications_templates table

```
Create the migration file supabase/migrations/20240005000000_add_communications_templates.sql with:

CREATE TABLE communications_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
  subject TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event, channel)
);

ALTER TABLE communications_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage templates" ON communications_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

INSERT INTO communications_templates (event, channel, body) VALUES
  ('order_placed',      'sms',   'Hi {{customer_name}}, your Shero order #{{order_id}} has been placed! Total: ${{total}}. We will notify you when the kitchen confirms.'),
  ('order_accepted',    'sms',   'Your Shero order #{{order_id}} has been accepted by {{kitchen_name}}! Estimated delivery: {{eta}}.'),
  ('preparing',         'sms',   'Your Shero order #{{order_id}} is being prepared. Hang tight!'),
  ('out_for_delivery',  'sms',   'Your Shero order #{{order_id}} is on the way! ETA: {{eta}}.'),
  ('delivered',         'sms',   'Your Shero order #{{order_id}} has been delivered. Enjoy your meal! Rate us: {{rating_url}}'),
  ('cancelled',         'sms',   'Your Shero order #{{order_id}} has been cancelled. Refund of ${{total}} will appear in 3-5 business days or your Shero wallet.');
```

---

## Phase 1.6 — Real-time Order Tracking

---

### Command 1.6.1 — Replace mock data in OrderTracking.tsx

```
Open src/pages/OrderTracking.tsx.

1. Remove the import of mockTrackedOrder (and any mock data file it comes from)
   and all usages of that variable throughout the file.

2. Add useSearchParams from react-router-dom and read orderId:
   const [searchParams] = useSearchParams();
   const orderId = searchParams.get('orderId');

3. Add a useQuery (from @tanstack/react-query) that fetches the order:
   supabase.from('instant_orders').select('*').eq('id', orderId).single()
   with queryKey: ['instant_orders', orderId]
   only enabled when orderId is not null

4. If orderId is null, render: <p>No order ID provided.</p>
5. While loading, render the existing loading skeleton or a spinner
6. If the query returns an error or null data, render: <p>Order not found.</p>
7. Otherwise, render the existing tracking UI using the real order data fields
```

---

### Command 1.6.2 — Add Supabase Realtime subscription to OrderTracking.tsx

```
Open src/pages/OrderTracking.tsx.

After the useQuery for the order, add a useEffect that:
1. Creates a Supabase Realtime channel:
   const channel = supabase.channel('order-tracking-' + orderId)
2. Subscribes to postgres_changes for UPDATE events on the instant_orders table
   filtered to id = orderId:
   .on('postgres_changes', {
     event: 'UPDATE',
     schema: 'public',
     table: 'instant_orders',
     filter: 'id=eq.' + orderId
   }, (payload) => {
     // Update local state or invalidate the query
   })
   .subscribe()
3. In the handler, call queryClient.setQueryData(['instant_orders', orderId], payload.new)
   to update the cached order without a full refetch
4. In the useEffect cleanup function, call supabase.removeChannel(channel)

The effect should only run when orderId changes and should do nothing if orderId is null.
```

---

### Command 1.6.3 — Map DB status to tracking progress bar

```
Open src/pages/OrderTracking.tsx.

1. Add the following constant near the top of the file (after imports):

const STATUS_STEPS: Record<string, number> = {
  payment_pending: 0,
  accepted: 1,
  preparing: 2,
  ready: 3,
  rider_assigned: 4,
  picked_up: 5,
  in_transit: 6,
  near_destination: 7,
  delivered: 8,
};

2. Find the progress bar or step indicator component that currently uses a hardcoded
   step number or the mock data's status. Replace it to derive the current step from:
   const currentStep = STATUS_STEPS[order?.status] ?? 0;

3. Pass currentStep to the progress bar component instead of any hardcoded value.

4. Do not change the visual design of the progress bar or the step labels.
```

---

### Command 1.6.4 — Add ETA display and countdown

```
Open src/pages/OrderTracking.tsx.

1. Find the ETA display section (it may currently show a static time or mock value).
   Replace it to read from the order's estimated_delivery_at field:
   const eta = order?.estimated_delivery_at ? new Date(order.estimated_delivery_at) : null;

2. Add a useState and setInterval to show a live countdown:
   - Calculate remaining minutes: Math.max(0, Math.floor((eta - Date.now()) / 60000))
   - Update every 30 seconds using setInterval
   - Clear the interval on component unmount

3. Display the ETA as: "Arriving in ~{remainingMinutes} min" if remainingMinutes > 0,
   or "Arriving shortly" if remainingMinutes === 0

4. If eta is null, display "Calculating ETA..."

Do not change any other part of the tracking UI.
```

---

### Command 1.6.5 — Wire order modification request

```
Open src/pages/OrderTracking.tsx.

Find the "Modify Order" button (it may be currently disabled or do nothing).
Wire it to:
1. On click, show the existing modification dialog/modal
2. On confirm in the dialog, call:
   supabase.from('order_modifications').insert({
     order_id: orderId,
     customer_id: currentUserId,
     mod_type: selectedModType,
     description: modDescription,
     status: 'pending'
   })
3. Show a success toast: "Modification request submitted. Our team will review it shortly."
4. Show an error toast if the insert fails
5. Close the dialog after submission

Do not change the dialog UI markup or styling.
The modification button should only be visible when the order status is
'accepted' or 'preparing' (not yet ready or out for delivery).
```

---

### Command 1.6.6 — Wire cancel order flow

```
Open src/pages/OrderTracking.tsx.

Find the "Cancel Order" button and wire it end-to-end:
1. On click, show the existing cancel confirmation dialog
2. On confirm:
   a. Call supabase.from('instant_orders').update({ status: 'cancelled' }).eq('id', orderId)
   b. Call the trigger-notification Edge Function:
      fetch('/functions/v1/trigger-notification', { method: 'POST', body: JSON.stringify({ orderId, event: 'cancelled' }) })
   c. Call the process-refund Edge Function:
      fetch('/functions/v1/process-refund', { method: 'POST', body: JSON.stringify({ orderId }) })
   d. Navigate to /customer after all three calls succeed
   e. Show an error toast if any call fails and do not navigate

The cancel button should only be visible when the order status is
'payment_pending', 'accepted', or 'preparing'.
Hide it once the order is 'ready', 'rider_assigned', or further along.
```

---

### Command 1.6.7 — Create `process-refund` Edge Function

```
Create the file supabase/functions/process-refund/index.ts as a Supabase Edge Function
written in Deno/TypeScript.

The function must:
- Accept HTTP POST with JSON body { orderId: string }
- Create a Supabase client using SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from Deno.env
- Fetch the instant_orders row for orderId to get payment_intent_id and total_amount and customer_id
- If payment_intent_id is null (e.g. COD order), skip Stripe and just update the order status
- Otherwise call the Stripe Refunds API:
  POST https://api.stripe.com/v1/refunds
  with application/x-www-form-urlencoded body: payment_intent={payment_intent_id}
  using HTTP Bearer auth with STRIPE_SECRET_KEY from Deno.env
- On successful Stripe refund, insert a row into wallet_transactions:
  { user_id: customer_id, amount: total_amount, type: 'credit', reason: 'refund', order_id: orderId }
- Return HTTP 200 { success: true, refundId: refund.id }
- Return HTTP 404 if order not found
- Return HTTP 500 on Stripe or DB error
- Set CORS headers to allow requests from any origin
```

---

### Command 1.6.8 — Pass orderId through full flow

```
Make the following changes across two files:

FILE 1: src/pages/Checkout.tsx
After the order is successfully created AND payment is confirmed (inside onPaymentSuccess),
navigate to: /order-confirmation?orderId={newOrderId}
Replace any existing navigation after payment that goes to /order-confirmation without the query param.

FILE 2: src/pages/OrderConfirmation.tsx
1. Read orderId from useSearchParams: const orderId = searchParams.get('orderId')
2. Find the "Track Order" button or link. Change its destination to:
   /order-tracking?orderId={orderId}
3. If orderId is null, show the confirmation page normally without the Track Order button.
```

---

## Phase 1.7 — Customer Dashboard

---

### Command 1.7.1 — Remove mock orderHistory from Profile.tsx

```
Open src/pages/Profile.tsx.

1. Find the constant or array named orderHistory (it is likely a hardcoded array of
   mock order objects used as a fallback). Delete the entire constant declaration.

2. Find all places in the JSX that reference orderHistory and replace them with
   liveOrders (the state variable that fetches from instant_orders via Supabase).

3. Add a loading state: while the liveOrders query is loading, show a skeleton loader
   (use the existing Skeleton component from shadcn/ui if available, or a simple
   <div className="animate-pulse h-16 bg-gray-100 rounded-lg" />)

4. Add an empty state: if liveOrders is loaded and has 0 items, show:
   <p className="text-center text-muted-foreground py-8">No orders yet. Start exploring kitchens!</p>
   with a "Browse Kitchens" button linking to /instant-delivery

5. Do not change any other section of the Profile page (wallet, settings, referrals, FAQs).
```

---

### Command 1.7.2 — Create wallet_transactions migration

```
Create the file supabase/migrations/20240007000000_add_wallet_transactions.sql with:

CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  reason TEXT CHECK (reason IN ('referral', 'spin', 'order_use', 'refund', 'manual', 'promo')),
  order_id UUID REFERENCES instant_orders(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own wallet" ON wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own wallet debit" ON wallet_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id AND type = 'debit');

CREATE INDEX wallet_transactions_user_id_idx ON wallet_transactions(user_id, created_at DESC);
```

---

### Command 1.7.3 — Update WalletContext to read from Supabase

```
Open src/contexts/WalletContext.tsx.

Make the following changes:

1. Replace the useState balance with a useQuery (from @tanstack/react-query):
   queryKey: ['wallet_balance', userId]
   queryFn: async () => {
     const { data } = await supabase.rpc('get_wallet_balance', { p_user_id: userId })
     return data ?? 0
   }
   enabled: !!userId
   Return balance from the query result (default to 0 while loading)

2. Also create the migration file supabase/migrations/20240007000001_add_get_wallet_balance_rpc.sql:
   CREATE OR REPLACE FUNCTION get_wallet_balance(p_user_id UUID)
   RETURNS DECIMAL AS $$
     SELECT COALESCE(SUM(amount), 0)
     FROM wallet_transactions
     WHERE user_id = p_user_id
       AND (expires_at IS NULL OR expires_at > now())
   $$ LANGUAGE SQL STABLE SECURITY DEFINER;

3. Replace the addCredit(amount, reason) function to:
   supabase.from('wallet_transactions').insert({ user_id: userId, amount, type: 'credit', reason })
   then call queryClient.invalidateQueries({ queryKey: ['wallet_balance', userId] })

4. Replace the deductBalance(amount, reason, orderId) function to:
   supabase.from('wallet_transactions').insert({ user_id: userId, amount: -amount, type: 'debit', reason, order_id: orderId })
   then call queryClient.invalidateQueries({ queryKey: ['wallet_balance', userId] })

5. Keep the context shape { balance, addCredit, deductBalance, isLoading } unchanged
   so no consumer components need to be updated.
```

---

### Command 1.7.4 — Add referral code to profiles

```
Make the following changes:

1. Create the migration file supabase/migrations/20240007000002_add_referral_code_to_profiles.sql:

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS spin_used BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := upper(substring(md5(NEW.id::text || random()::text) from 1 for 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();

2. Open src/contexts/AuthContext.tsx (or wherever the profile data is fetched after login).
   Make sure the referral_code field is included in the profiles SELECT query.
   Expose it on the auth context so components can read currentUser.referralCode.

3. Open src/pages/CustomerReferrals.tsx.
   Replace any hardcoded or mock referral code with: profile?.referral_code ?? '...'
   The share link should be: window.location.origin + '/auth?ref=' + referralCode
```

---

### Command 1.7.5 — Wire referral reward on signup

```
Create the file supabase/functions/process-referral/index.ts as a Supabase Edge Function
written in Deno/TypeScript.

The function must:
- Accept HTTP POST with JSON body { newUserId: string, referralCode: string }
- Create a Supabase client using SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from Deno.env
- Look up the referrer: SELECT user_id FROM profiles WHERE referral_code = referralCode LIMIT 1
- If referrer not found, return HTTP 404 { error: "Referral code not found" }
- Check that the newUserId has not already used a referral (query wallet_transactions for
  reason = 'referral' and user_id = newUserId; if exists, return HTTP 409)
- Insert two rows into wallet_transactions:
  1. { user_id: referrerId, amount: 5.00, type: 'credit', reason: 'referral' }  (referrer gets $5)
  2. { user_id: newUserId, amount: 3.00, type: 'credit', reason: 'referral' }   (new user gets $3)
- Return HTTP 200 { success: true }
- Return HTTP 500 on DB error

Then open src/pages/Auth.tsx and in the handleVerifyOtp success handler:
- After the user is signed in, check if window.location.search contains ?ref=
- If yes, extract the referral code and call fetch('/functions/v1/process-referral',
  { method: 'POST', body: JSON.stringify({ newUserId: user.id, referralCode: code }) })
- Do not block the sign-in flow on the referral call; fire and forget
```

---

### Command 1.7.6 — Wire spin wheel to wallet

```
Open src/pages/Profile.tsx (or the component that renders the spin wheel, search for
"spin" in the src/ directory to find the right file).

Make the following changes:
1. Read profile.spin_used from the auth context or a useQuery on the profiles table
2. Only render the spin wheel / "Spin to Win" button if spin_used === false
3. If spin_used === true, show a disabled state with text "Already spun!"
4. After the spin animation completes and a winning amount is determined:
   a. Call addCredit(wonAmount, 'spin') from the WalletContext
   b. Call supabase.from('profiles').update({ spin_used: true }).eq('id', userId)
   c. Invalidate the profile query so the button becomes disabled immediately
   d. Show a success toast: "You won $X.XX Shero wallet credit!"
```

---

### Command 1.7.7 — Wire customer settings save

```
Find the CustomerSettings component (search for "settings" or "CustomerSettings"
in the src/pages/ or src/components/ directory).

Wire the save/submit button to persist changes to Supabase:
1. On form submit, call:
   supabase.from('profiles').upsert({
     id: userId,
     full_name: formValues.fullName,
     phone: formValues.phone,
     email: formValues.email,
     address: formValues.address  // store as JSONB
   }, { onConflict: 'id' })
2. Show a success toast "Settings saved" on success
3. Show an error toast on failure
4. Keep the existing form fields, validation, and styling unchanged
5. If there is already a mutation or save function, wire it to Supabase instead of
   the current stub/no-op
```

---

## Phase 1.8 — Admin Dashboard — Orders & Operations

---

### Command 1.8.1 — Create useUpdateInstantOrder mutation hook

```
Open src/hooks/useSupabaseData.ts.

Add a new exported custom hook named useUpdateInstantOrder using useMutation from
@tanstack/react-query.

The hook must:
- Accept no arguments
- The mutation function receives { id: string, updates: Partial<InstantOrder> }
- Call supabase.from('instant_orders').update(updates).eq('id', id)
- On success, invalidate the query cache for ['instant_orders'] and ['instant_orders', id]
- On success, also call the trigger-notification Edge Function if updates.status is one of:
  'accepted' | 'preparing' | 'ready' | 'rider_assigned' | 'in_transit' | 'delivered' | 'cancelled'
  using fetch('/functions/v1/trigger-notification', { method: 'POST', body: JSON.stringify({ orderId: id, event: updates.status }) })
- Return the useMutation result object

Use the same TypeScript types and Supabase client instance as the other hooks in the file.
```

---

### Command 1.8.2 — Wire admin order status buttons in AdminOrders.tsx

```
Open src/pages/admin/AdminOrders.tsx.

For each order action button (Accept, Preparing, Ready, Assign Delivery, In Transit,
Delivered, Cancel, Reject), wire it to call the useUpdateInstantOrder mutation:

1. Import and call useUpdateInstantOrder at the top of the component
2. For each button, replace any stub onClick handler with:
   updateOrder.mutate({ id: order.id, updates: { status: '<new_status>' } })
   using the correct status string for each action:
   - Accept → 'accepted'
   - Start Preparing → 'preparing'
   - Mark Ready → 'ready'
   - Assign Delivery → 'rider_assigned' (also set delivery_details)
   - Mark In Transit → 'in_transit'
   - Mark Delivered → 'delivered'
   - Cancel → 'cancelled' (also call process-refund if order.payment_method !== 'cod')
   - Reject → 'rejected'
3. Show a loading spinner on the clicked button while updateOrder.isPending
4. Show a toast on updateOrder.isError with the error message
5. Do not change any UI layout, table structure, or filter logic
```

---

### Command 1.8.3 — Create `dispatch-delivery` Edge Function

```
Create the file supabase/functions/dispatch-delivery/index.ts as a Supabase Edge Function
written in Deno/TypeScript.

The function must:
- Accept HTTP POST with JSON body { orderId: string }
- Create a Supabase client using SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from Deno.env
- Fetch the instant_orders row for orderId including delivery_address, total_amount,
  kitchen_partner data (pickup address), and customer phone
- Call the DoorDash Drive API to create a delivery:
  POST https://openapi.doordash.com/drive/v2/deliveries
  Headers: Authorization: Bearer {DOORDASH_JWT} (generate a DoorDash JWT using
  DOORDASH_DEVELOPER_ID, DOORDASH_KEY_ID, DOORDASH_SIGNING_SECRET from Deno.env)
  Body: {
    external_delivery_id: orderId,
    pickup_address: kitchen address,
    pickup_phone_number: kitchen phone,
    dropoff_address: customer delivery address,
    dropoff_phone_number: customer phone,
    order_value: total_amount * 100
  }
- Store the returned delivery_id and tracking_url from DoorDash in instant_orders:
  supabase.from('instant_orders').update({
    delivery_details: doordashResponse,
    tracking_url: doordashResponse.tracking_url
  }).eq('id', orderId)
- Return HTTP 200 { success: true, deliveryId: doordashResponse.delivery_id, trackingUrl }
- Return HTTP 500 on error with the error message

Also create the migration:
supabase/migrations/20240008000000_add_delivery_columns_to_instant_orders.sql
ALTER TABLE instant_orders
  ADD COLUMN IF NOT EXISTS delivery_details JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tracking_url TEXT,
  ADD COLUMN IF NOT EXISTS estimated_delivery_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
```

---

### Command 1.8.4 — Wire manual order creation

```
Open src/pages/admin/AdminManualOrder.tsx.

Find the form submit handler. It may be a stub or a console.log. Replace it to:
1. Call supabase.from('instant_orders').insert({
     customer_name: formValues.customerName,
     customer_phone: formValues.customerPhone,
     customer_id: formValues.customerId ?? null,
     kitchen_id: formValues.kitchenId,
     items: formValues.items,           // JSONB array
     subtotal: formValues.subtotal,
     total_amount: formValues.totalAmount,
     delivery_address: formValues.deliveryAddress,
     payment_method: 'cod',
     source: 'manual',
     status: 'accepted'
   })
2. After successful insert, call fetch('/functions/v1/trigger-notification',
   { method: 'POST', body: JSON.stringify({ orderId: newOrder.id, event: 'order_placed' }) })
3. Show a success toast "Manual order created: #" + newOrder.id
4. Reset the form after success
5. Show an error toast on failure
6. Do not change the form UI, field layout, or validation
```

---

## Phase 1.9 — Partner Portal

---

### Command 1.9.1 — Wire order Accept/Decline in PartnerOrders.tsx

```
Open src/pages/partner/PartnerOrders.tsx.

1. Import and call useUpdateInstantOrder from src/hooks/useSupabaseData.ts
2. Wire the "Accept" button to: updateOrder.mutate({ id: order.id, updates: { status: 'preparing' } })
3. Wire the "Decline" / "Reject" button to:
   updateOrder.mutate({ id: order.id, updates: { status: 'rejected' } })
   After rejection, also call process-refund if the order was paid online:
   if (order.payment_method !== 'cod') {
     fetch('/functions/v1/process-refund', { method: 'POST', body: JSON.stringify({ orderId: order.id }) })
   }
4. Show a loading spinner on the clicked button while updateOrder.isPending
5. Show error toasts on failure
6. Do not change any other logic or UI in the file
```

---

### Command 1.9.2 — Wire prep timer and Mark Ready button

```
Open src/pages/partner/PartnerOrders.tsx.

For orders in 'preparing' status:
1. Show a countdown timer that starts from kitchen.prep_time_minutes (read from
   kitchen_partners.prep_time_minutes for the current partner's kitchen; default to 20)
2. Use useState + useEffect with setInterval to count down every second
3. Display as "MM:SS" format
4. When the timer reaches 0, show a pulsing visual indicator to prompt the partner
   to mark the order ready
5. Wire the "Mark Ready" button to:
   updateOrder.mutate({ id: order.id, updates: { status: 'ready' } })
6. Clear the interval when the component for that order unmounts or status changes
```

---

### Command 1.9.3 — Wire kitchen attendance toggle

```
Open src/pages/partner/PartnerKitchenAttendance.tsx.

Find the toggle/switch that marks the kitchen as live or offline. Wire it to persist to
Supabase:
1. Read the current is_attendance_marked value from the kitchen_partners row for the
   current partner (use the existing useKitchenPartner or usePartnerKitchen hook, or
   query directly)
2. On toggle change, call:
   supabase.from('kitchen_partners')
     .update({ is_attendance_marked: newValue })
     .eq('id', kitchenId)
3. Show a toast: "Kitchen is now LIVE" or "Kitchen is now OFFLINE"
4. Show an error toast and revert the toggle on failure
5. Do not change the visual design of the toggle
```

---

### Command 1.9.4 — Verify partner menu CRUD writes to Supabase

```
Open src/pages/partner/PartnerMenuItems.tsx.

Verify that:
1. Creating a new menu item calls supabase.from('instant_menu_items').insert({ ...item, kitchen_id: currentPartner.kitchenId })
2. Editing an item calls supabase.from('instant_menu_items').update({ ...updates }).eq('id', itemId)
3. Deleting an item calls supabase.from('instant_menu_items').delete().eq('id', itemId)
4. Toggling is_toggled_on calls supabase.from('instant_menu_items').update({ is_toggled_on: newValue }).eq('id', itemId)

For any of the above that are currently stubs, no-ops, or console.logs, replace them
with the correct Supabase call. Invalidate the ['instant_menu_items', kitchenId] query
key after each mutation. Show success and error toasts for each operation.
```

---

### Command 1.9.5 — Calculate partner earnings from real orders

```
Open src/pages/partner/PartnerEarnings.tsx.

Replace any mock earnings data or hardcoded numbers with real data from Supabase:

1. Query instant_orders where kitchen_id = currentPartner.kitchenId AND status = 'delivered'
2. Group or filter by the selected time period (today / this week / this month) using
   the order's created_at timestamp
3. Calculate:
   - gross_revenue = SUM(subtotal)
   - tips_total = SUM(tip_amount)
   - platform_fee = gross_revenue * (1 - commission_rate)
     where commission_rate = kitchen_partners.commission_rate (default 0.75 if not set)
   - net_earnings = gross_revenue * commission_rate + tips_total
4. Display these four values in the existing earnings cards
5. Keep the existing card layout, chart components, and date-range filter UI unchanged
   — only replace the data source
```

---

### Command 1.9.6 — Real-time new order toast for partner

```
Open src/pages/partner/PartnerOrders.tsx.

Add a Supabase Realtime subscription that notifies the partner when a new order arrives:

1. In a useEffect, create a channel:
   supabase.channel('new-partner-orders')
   .on('postgres_changes', {
     event: 'INSERT',
     schema: 'public',
     table: 'instant_orders',
     filter: 'kitchen_id=eq.' + currentPartner.kitchenId
   }, (payload) => {
     // Show toast and play alert sound
   })
   .subscribe()

2. In the handler:
   a. Call queryClient.invalidateQueries({ queryKey: ['partner_orders'] }) to refresh the list
   b. Show a prominent toast: "New order received! #" + payload.new.id
   c. Play a brief alert sound using new Audio('/notification.mp3').play()
      (assume the file will be placed at public/notification.mp3 — do not create the file,
      just add the code with a try/catch in case the file is missing)

3. Unsubscribe in the useEffect cleanup function
```

---

## Phase 1.10 — Finance, Compliance & QA

---

### Command 1.10.1 — Verify tax calculation in invoiceGenerator

```
Open src/utils/invoiceGenerator.ts (or the file responsible for calculating invoice totals
and tax — search for "tax" in src/utils/ if the filename is different).

Verify or add the following:
1. Tax rates must be looked up from app_config.invoice_settings rather than hardcoded.
   If hardcoded, replace with a parameter or a lookup from the Supabase app_config table.
2. Add (or verify) these state-level combined tax rates as the default fallback:
   { TX: 0.0825, FL: 0.07 }
3. Tax must be calculated as: tax = subtotal * taxRate (applied to subtotal, not including delivery fee)
4. The invoice PDF must show: Subtotal, Tax ({state} {rate}%), Delivery Fee, Tip, Total
5. If the tax rate calculation is already correct, make no changes and report what was found.
```

---

### Command 1.10.2 — Add RLS policies for instant_orders

```
Create the migration file supabase/migrations/20240010000000_add_instant_orders_rls.sql

Add the following RLS policies to the instant_orders table (drop and recreate if they exist):

ALTER TABLE instant_orders ENABLE ROW LEVEL SECURITY;

-- Customers can see their own orders
CREATE POLICY "Customers view own orders" ON instant_orders
  FOR SELECT USING (auth.uid() = customer_id);

-- Customers can create new orders for themselves
CREATE POLICY "Customers create own orders" ON instant_orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Customers can cancel their own orders within the first 5 minutes
CREATE POLICY "Customers cancel own orders" ON instant_orders
  FOR UPDATE USING (
    auth.uid() = customer_id
    AND status IN ('payment_pending', 'accepted', 'preparing')
    AND created_at > now() - INTERVAL '5 minutes'
  ) WITH CHECK (status = 'cancelled');

-- Partners can see orders assigned to their kitchen
CREATE POLICY "Partners view kitchen orders" ON instant_orders
  FOR SELECT USING (
    kitchen_id IN (
      SELECT id FROM kitchen_partners WHERE owner_id = auth.uid()
    )
  );

-- Partners can update status of their kitchen's orders
CREATE POLICY "Partners update kitchen orders" ON instant_orders
  FOR UPDATE USING (
    kitchen_id IN (
      SELECT id FROM kitchen_partners WHERE owner_id = auth.uid()
    )
  );
```

---

### Command 1.10.3 — Track promo code usage

```
Open src/contexts/CartContext.tsx (or wherever applyPromoCode is implemented).

Find the applyPromoCode function. After successfully validating a promo code, add:
1. Do not increment usage_count here (it is applied on order creation to avoid
   counting abandoned carts)

Then open src/pages/Checkout.tsx.
Find where the order is inserted into instant_orders.
Add the applied promo code ID to the order: promo_code_id: appliedPromo?.id ?? null

Then create the migration:
supabase/migrations/20240010000001_add_promo_usage_trigger.sql

CREATE OR REPLACE FUNCTION increment_promo_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.promo_code_id IS NOT NULL THEN
    UPDATE promotions SET usage_count = usage_count + 1 WHERE id = NEW.promo_code_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_created_increment_promo
  AFTER INSERT ON instant_orders
  FOR EACH ROW EXECUTE FUNCTION increment_promo_usage();
```

---

### Command 1.10.4 — Add Zod validation to Checkout form

```
Open src/pages/Checkout.tsx.

The form uses react-hook-form. Add or extend the Zod schema for the checkout form fields:

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  addressLine1: z.string().min(5, 'Please enter a valid address'),
  zip: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
  city: z.string().min(2, 'City is required'),
  state: z.string().length(2, 'State must be 2-letter code'),
  deliverySlot: z.string().min(1, 'Please select a delivery slot'),
});

Pass zodResolver(checkoutSchema) to useForm. Display validation error messages
below each field using the existing form error display pattern in the file.
Do not change any field labels, layout, or styling.
```

---

### Command 1.10.5 — Write cart unit tests

```
Create the file src/tests/cart.test.ts (or src/__tests__/cart.test.ts if that directory exists).

Write Vitest unit tests for the CartContext using @testing-library/react:

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../contexts/CartContext';

Test the following scenarios:
1. "adds an item to the cart" — call addItem with a mock item, expect items length to be 1
2. "increments quantity when the same item is added twice" — add the same item twice, expect quantity to be 2
3. "removes item when quantity is updated to 0" — add item then updateQuantity(id, 0), expect items to be empty
4. "applies a valid promo code" — mock the Supabase promotions query to return a valid promo,
   call applyPromoCode('SAVE10'), expect discount to be applied
5. "clears the cart" — add items then call clearCart, expect items to be empty array
6. "persists to localStorage on change" — add an item, expect localStorage.getItem('shero_cart') to not be null

Mock the Supabase client using vi.mock to avoid real network calls.
```

---

## 🔑 Environment Variables Reference

Add these to your `.env.local` file (frontend) and Supabase Edge Function secrets:

```bash
# Frontend (.env.local)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_GOOGLE_MAPS_API_KEY=AIza...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Supabase Edge Function Secrets (set via: supabase secrets set KEY=value)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SID=VA...
TWILIO_FROM_NUMBER=+1...
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=orders@shero.us
DOORDASH_DEVELOPER_ID=...
DOORDASH_KEY_ID=...
DOORDASH_SIGNING_SECRET=...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_URL=https://your-project.supabase.co
```

---

## 📋 Completion Checklist

Use this to track progress as you run each command through Copilot Agent:

### Phase 1.1 — Auth
- [ ] 1.1.1 send-otp Edge Function
- [ ] 1.1.2 verify-otp Edge Function
- [ ] 1.1.3 Wire OTP into Auth.tsx
- [ ] 1.1.4 New-user profile trigger
- [ ] 1.1.5 RequireAuth component
- [ ] 1.1.6 OTP rate limiting

### Phase 1.2 — Kitchen Discovery
- [ ] 1.2.1 get_nearby_kitchens SQL function
- [ ] 1.2.2 Update useNearbyKitchenPartners hook
- [ ] 1.2.3 ZIP code fallback
- [ ] 1.2.4 Real-time attendance badge

### Phase 1.3 — Cart Persistence
- [ ] 1.3.1 localStorage sync
- [ ] 1.3.2 cart_items migration
- [ ] 1.3.3 Sync cart to Supabase

### Phase 1.4 — Checkout & Payment
- [ ] 1.4.1 Install Stripe packages
- [ ] 1.4.2 create-payment-intent Edge Function
- [ ] 1.4.3 stripe-webhook Edge Function
- [ ] 1.4.4 Replace PaymentSection with Stripe Elements
- [ ] 1.4.5 Update Checkout order creation flow
- [ ] 1.4.6 AddressAutocomplete component
- [ ] 1.4.7 Wire wallet to checkout

### Phase 1.5 — Notifications
- [ ] 1.5.1 send-sms Edge Function
- [ ] 1.5.2 send-order-email Edge Function
- [ ] 1.5.3 trigger-notification Edge Function
- [ ] 1.5.4 communications_templates migration

### Phase 1.6 — Order Tracking
- [ ] 1.6.1 Remove mock data from OrderTracking.tsx
- [ ] 1.6.2 Realtime subscription
- [ ] 1.6.3 Status → progress bar mapping
- [ ] 1.6.4 ETA countdown display
- [ ] 1.6.5 Order modification request
- [ ] 1.6.6 Cancel order flow
- [ ] 1.6.7 process-refund Edge Function
- [ ] 1.6.8 Pass orderId through full flow

### Phase 1.7 — Customer Dashboard
- [ ] 1.7.1 Remove mock orderHistory
- [ ] 1.7.2 wallet_transactions migration
- [ ] 1.7.3 Update WalletContext
- [ ] 1.7.4 Referral code on profiles
- [ ] 1.7.5 process-referral Edge Function + signup hook
- [ ] 1.7.6 Spin wheel → wallet
- [ ] 1.7.7 Customer settings save

### Phase 1.8 — Admin Dashboard
- [ ] 1.8.1 useUpdateInstantOrder hook
- [ ] 1.8.2 Wire admin order buttons
- [ ] 1.8.3 dispatch-delivery Edge Function
- [ ] 1.8.4 Manual order creation

### Phase 1.9 — Partner Portal
- [ ] 1.9.1 Accept/Decline order buttons
- [ ] 1.9.2 Prep timer + Mark Ready
- [ ] 1.9.3 Attendance toggle
- [ ] 1.9.4 Menu CRUD verification
- [ ] 1.9.5 Real earnings from DB
- [ ] 1.9.6 New order toast (realtime)

### Phase 1.10 — Finance & QA
- [ ] 1.10.1 Tax calculation verification
- [ ] 1.10.2 RLS policies for instant_orders
- [ ] 1.10.3 Promo usage tracking
- [ ] 1.10.4 Zod validation on checkout
- [ ] 1.10.5 Cart unit tests
