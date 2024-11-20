"use client";

import { useState, useEffect } from "react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];

export function CurrencyConverter() {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [result, setResult] = useState("");

  const handleConvert = async () => {
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      const data = await response.json();
      const rate = data.rates[toCurrency];
      const convertedAmount = (parseFloat(amount) * rate).toFixed(2);
      setResult(`${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`);
    } catch (error) {
      console.error("Error converting currency:", error);
      setResult("Failed to convert currency. Please try again.");
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Currency Converter</h3>
      <div className="flex space-x-2 mb-4">
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="w-1/3"
        />
        <Select
          value={fromCurrency}
          onValueChange={setFromCurrency}
          className="w-1/3"
        >
          {currencies.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </Select>
        <Select
          value={toCurrency}
          onValueChange={setToCurrency}
          className="w-1/3"
        >
          {currencies.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </Select>
      </div>
      <Button onClick={handleConvert}>Convert</Button>
      {result && <p className="mt-4">{result}</p>}
    </div>
  );
}