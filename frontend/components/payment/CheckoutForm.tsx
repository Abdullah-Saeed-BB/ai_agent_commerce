import React, { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

interface CheckoutFormProps {
  clientSecret: string;
}

const VisaIcon = () => (
  <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-80">
    <path d="M12.9837 14.1507L14.9351 1.83401H17.9942L16.0427 14.1507H12.9837ZM23.363 1.83401C22.6105 1.57947 21.4116 1.34149 20.0631 1.34149C17.0706 1.34149 14.9378 2.94639 14.9189 5.25368C14.8961 7.15573 16.634 8.21639 17.9157 8.84755C19.2325 9.49755 19.673 9.90793 19.6676 10.5365C19.6581 11.4984 18.5286 11.9366 17.2281 11.9366C15.6565 11.9366 14.7334 11.5034 13.9809 11.1444L13.5674 10.9458L13.123 13.7297C13.9149 14.0954 15.421 14.4172 16.9942 14.4336C20.1706 14.4336 22.281 12.8529 22.3081 10.4578C22.327 8.93297 21.3283 7.74712 18.0664 6.18342C16.8923 5.61746 16.2081 5.23438 16.2202 4.54589C16.2202 3.88295 16.9451 3.2384 18.4312 3.2384C19.7427 3.21852 20.69 3.53509 21.4183 3.8643L21.7318 4.01524L22.1831 1.83401H23.363ZM30.4042 14.1507H33.0031L29.5691 1.83401H27.1356C26.541 1.83401 26.0465 2.21323 25.8113 2.75338L22.1332 14.1507H25.3344L25.9735 12.3862H29.2435L29.5489 14.1507H30.4042ZM26.8398 10.0211L28.1464 6.42588L28.8923 10.0211H26.8398ZM10.2974 1.83401L7.42082 10.4735L7.12628 9.00693C6.73282 6.57861 5.09772 4.11634 2.89886 2.87321L3.92178 14.1507H7.13028L11.4583 1.83401H10.2974Z" fill="#1434CB"/>
    <path d="M0 1.83401L0.0135118 2.05267C2.79888 2.62886 5.86791 4.00412 7.02728 5.75169L6.21652 1.83401H0Z" fill="#F7B600"/>
  </svg>
);

const inputStyle = {
  style: {
    base: {
      fontSize: "16px",
      color: "#ededed",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      "::placeholder": { color: "#6b7280" },
      iconColor: "#ededed",
    },
    invalid: { color: "#ef4444" },
  },
};

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardNumberElement)!,
        },
      }
    );

    console.log("Error message:", error);

    if (error) {
      setMessage(error.message || "An error occurred.");
    } else if (paymentIntent?.status === "succeeded") {
      setMessage("Payment successful!");
      window.location.reload();
    } else {
      setMessage("An unexpected status occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#141414] p-8 rounded-sm shadow-sm border border-white/5"
    >
      <h2 className="text-xl font-bold uppercase italic tracking-tight mb-6 text-white border-b border-white/10 pb-4">
        Payment Details
      </h2>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            Card Number
          </label>
          <div className="relative p-4 border border-white/10 bg-black/50 rounded-sm focus-within:border-[#d4af37] focus-within:ring-1 focus-within:ring-[#d4af37] transition-all">
            <CardNumberElement options={inputStyle} />
            <VisaIcon />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Expiration
            </label>
            <div className="p-4 border border-white/10 bg-black/50 rounded-sm focus-within:border-[#d4af37] focus-within:ring-1 focus-within:ring-[#d4af37] transition-all">
              <CardExpiryElement options={inputStyle} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              CVC
            </label>
            <div className="p-4 border border-white/10 bg-black/50 rounded-sm focus-within:border-[#d4af37] focus-within:ring-1 focus-within:ring-[#d4af37] transition-all">
              <CardCvcElement options={inputStyle} />
            </div>
          </div>
        </div>
      </div>

      {message && message.includes("success") ? null : (
        <button
          disabled={isLoading || !stripe || !elements}
          id="submit"
          className="mt-8 w-full bg-[#d4af37] text-black font-bold uppercase tracking-widest py-4 px-6 rounded-sm hover:bg-[#b8962d] transition-all disabled:opacity-50"
        >
          <span id="button-text">{isLoading ? "Processing..." : "Pay now"}</span>
        </button>
      )}

      {message && (
        <div className={`mt-6 p-4 rounded-sm text-sm font-medium border ${message.includes("success") ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
          {message}
        </div>
      )}
    </form>
  );
};
