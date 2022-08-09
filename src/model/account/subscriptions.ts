import * as _ from 'lodash';
import { reportError } from '../../errors';
import { delay, doWhile } from '../../util/promise';

export interface SubscriptionPlan {
    id: number;
    name: string;
    prices?: {
        monthly: string;
        total: string;
    };
}

export const SubscriptionPlans = {
    'pro-monthly': { id: 550380, name: 'Pro (monthly)' } as SubscriptionPlan,
    'pro-annual': { id: 550382, name: 'Pro (annual)' } as SubscriptionPlan,
    'pro-perpetual': { id: 599788, name: 'Pro (perpetual)' } as SubscriptionPlan,
    'team-monthly': { id: 550789, name: 'Team (monthly)' } as SubscriptionPlan,
    'team-annual': { id: 550788, name: 'Team (annual)' } as SubscriptionPlan,
};

async function loadPlanPrices() {
    const data = {"success":true,"response":{"products":[{"product_id":550380,"product_title":"HTTP Toolkit Pro (monthly)","currency":"USD","vendor_set_prices_included_tax":false,"price":{"gross":15.54,"net":14,"tax":1.54},"list_price":{"gross":15.54,"net":14,"tax":1.54},"subscription":{"trial_days":0,"interval":"month","frequency":1,"price":{"gross":15.54,"net":14,"tax":1.54},"list_price":{"gross":15.54,"net":14,"tax":1.54}}},{"product_id":550382,"product_title":"HTTP Toolkit Pro (annual)","currency":"USD","vendor_set_prices_included_tax":false,"price":{"gross":133.2,"net":120,"tax":13.2},"list_price":{"gross":133.2,"net":120,"tax":13.2},"subscription":{"trial_days":0,"interval":"year","frequency":1,"price":{"gross":133.2,"net":120,"tax":13.2},"list_price":{"gross":133.2,"net":120,"tax":13.2}}},{"product_id":550788,"product_title":"HTTP Toolkit Team (annual)","currency":"USD","vendor_set_prices_included_tax":false,"price":{"gross":239.76,"net":216,"tax":23.76},"list_price":{"gross":239.76,"net":216,"tax":23.76},"subscription":{"trial_days":0,"interval":"year","frequency":1,"price":{"gross":239.76,"net":216,"tax":23.76},"list_price":{"gross":239.76,"net":216,"tax":23.76}}},{"product_id":550789,"product_title":"HTTP Toolkit Team (monthly)","currency":"USD","vendor_set_prices_included_tax":false,"price":{"gross":24.42,"net":22,"tax":2.42},"list_price":{"gross":24.42,"net":22,"tax":2.42},"subscription":{"trial_days":0,"interval":"month","frequency":1,"price":{"gross":24.42,"net":22,"tax":2.42},"list_price":{"gross":24.42,"net":22,"tax":2.42}}},{"product_id":599788,"product_title":"HTTP Toolkit Pro (perpetual)","currency":"USD","vendor_set_prices_included_tax":false,"price":{"gross":277.5,"net":250,"tax":27.5},"list_price":{"gross":277.5,"net":250,"tax":27.5},"subscription":{"trial_days":0,"interval":"year","frequency":99,"price":{"gross":277.5,"net":250,"tax":27.5},"list_price":{"gross":277.5,"net":250,"tax":27.5}}}]}};

    if (!data.success) {
        console.log(data);
        throw new Error("Price lookup request was unsuccessful");
    }

    const productPrices = data.response.products as Array<{
        product_id: number,
        currency: string,
        price: { net: number },
        subscription: { interval: string }
    }>;

    productPrices.forEach((productPrice) => {
        const plan = _.find(SubscriptionPlans,
            { id: productPrice.product_id }
        ) as SubscriptionPlan | undefined;

        if (!plan) return;

        const currency = productPrice.currency;
        const totalPrice = productPrice.price.net;
        const monthlyPrice = productPrice.subscription.interval === 'year'
            ? totalPrice / 12
            : totalPrice;

        plan.prices = {
            total: formatPrice(currency, totalPrice),
            monthly: formatPrice(currency, monthlyPrice)
        };
    });
}

// Async load all plan prices, repeatedly, until it works
doWhile(
    // Do: load the prices, with a timeout
    () => Promise.race([
        loadPlanPrices().catch(reportError),
        delay(5000) // 5s timeout
    ]).then(() => delay(1000)), // Limit the frequency

    // While: if any subs didn't successfully get data, try again:
    () => _.some(SubscriptionPlans, (plan) => !plan.prices),
);


function formatPrice(currency: string, price: number) {
    return Number(price).toLocaleString(undefined, {
        style:"currency",
        currency: currency,
        minimumFractionDigits: _.round(price) === price ? 0 : 2,
        maximumFractionDigits: 2
    })
}

export type SubscriptionPlanCode = keyof typeof SubscriptionPlans;

export const getSubscriptionPlanCode = (id: number | undefined) =>
    _.findKey(SubscriptionPlans, { id: id }) as SubscriptionPlanCode | undefined;

export const openCheckout = async (email: string, planCode: SubscriptionPlanCode) => {
    window.open(
        `https://pay.paddle.com/checkout/${
            SubscriptionPlans[planCode].id
        }?guest_email=${
            encodeURIComponent(email)
        }&referring_domain=app.httptoolkit.tech`,
        '_blank'
    );
}