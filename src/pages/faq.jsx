import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const faqData = [
        {
            question: "What goes into your sweets?",
            answer: "Our sweets are prepared using quality Sri Lankan ingredients such as coconut milk, kithul treacle, fresh jaggery, rice or gram flour, and carefully chosen local spices. Every item is made in small batches for a true homemade flavor."
        },
        {
            question: "Are your products suitable for vegans or those avoiding gluten?",
            answer: "Many of our sweets are vegetarian-friendly, and several options are naturally gluten-free. A few items may contain dairy or wheat. If you follow a special diet, please check the product notes or contact us before ordering."
        },
        {
            question: "How do you make sure the sweets stay fresh?",
            answer: "We only prepare your order after it's confirmed. Each item is packed carefully right after cooking so it reaches you as fresh as possible."
        },
        {
            question: "How long can I keep your sweets?",
            answer: "Storage time depends on the type of sweet. Most will stay fresh for about a week in an airtight container kept at room temperature. Since we don't use preservatives, it's best to enjoy them soon after delivery."
        },
        {
            question: "Do you deliver outside my area?",
            answer: "We currently deliver throughout Sri Lanka. If you're outside the delivery range or need a special arrangement, get in touch and we'll do our best to help."
        },
        {
            question: "What are the delivery fees and how long does it take?",
            answer: "Delivery costs vary depending on your location. Orders are usually delivered within 2 to 4 business days. You'll receive a tracking link once your package is on the way."
        },
        {
            question: "Can I return or exchange an order?",
            answer: "As our sweets are made fresh for each customer, we can't accept general returns. However, if there's an issue with your order — such as damage or an incorrect item — please contact us within 24 hours so we can fix it right away."
        },
        {
            question: "Which payment methods do you support?",
            answer: "You can pay using credit or debit cards, bank transfers, or cash on delivery. We also support selected mobile payment options for your convenience."
        },
        {
            question: "Do you accept large or event orders?",
            answer: "Yes, we handle bulk and event orders for weddings, corporate functions, and family gatherings. Contact us directly for pricing and arrangements."
        },
        {
            question: "Is it possible to personalize my order?",
            answer: "Yes! You can mix and match your favorite sweets, request gift packaging, or place special orders such as reduced-sugar or custom labeling. Just let us know your preferences when ordering."
        },
        {
            question: "Do you have a physical shop?",
            answer: "We currently operate online, but you can find us at selected pop-up stores and markets during festive seasons. Keep an eye on our social media for updates."
        }
    ];

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="pt-24 min-h-screen bg-orange-100">
            <div className="w-full max-w-5xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-orange-600 mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-xl text-gray-700">
                        Find answers to common questions about our products and services
                    </p>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {faqData.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
                        >
                            {/* Question Button */}
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none group"
                            >
                                <span className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors pr-4">
                                    {faq.question}
                                </span>
                                <span className="flex-shrink-0 text-orange-600">
                                    {openIndex === index ? (
                                        <ChevronUp size={24} className="transition-transform duration-300" />
                                    ) : (
                                        <ChevronDown size={24} className="transition-transform duration-300" />
                                    )}
                                </span>
                            </button>

                            {/* Answer Section */}
                            <div
                                className={`transition-all duration-300 ease-in-out ${
                                    openIndex === index
                                        ? 'max-h-96 opacity-100'
                                        : 'max-h-0 opacity-0'
                                } overflow-hidden`}
                            >
                                <div className="px-6 pb-5 pt-2 border-t border-gray-200">
                                    <p className="text-gray-700 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Section */}
                <div className="mt-12 bg-white rounded-lg shadow-md p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Still have questions?
                    </h2>
                    <p className="text-gray-700 mb-6">
                        Can't find the answer you're looking for? Please contact our support team.
                    </p>
                    <a
                        href="/contact"
                        className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
                    >
                        Contact Us
                    </a>
                </div>
            </div>
        </div>
    );
}