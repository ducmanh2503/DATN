# Cinema Forest Website

This project is a movie ticket booking website built with MySQL and React.js. The website offers a full range of features for users, such as browsing movies, booking tickets, and making payments. In addition, the system includes an admin dashboard for administrators to manage movies, show schedules, screenings, orders, ticket statuses, users, and statistics. A mini game is also integrated to enhance user engagement and encourage visitors to stay longer on the website.

## Features

---

### User

-   **User Authentication**: Users can register, log in, and manage their personal profiles.
-   **Browse Products**: Users can browse the product list, view details of each product, and search for products.
-   **Book Tickets**: Users can book movie tickets, purchase popcorn and drinks, update quantities, and apply discount codes or use loyalty points.
-   **Order Management**: Users can view the details of their ticket orders.
-   **Payment Processing**: The system integrates with payment gateways to ensure secure transactions.

## Admin Features

-   **Movie Management**: Administrators can add, update, and delete movies. Support for adding movies via Excel file.
-   **Show Schedule and Screening Management**: Administrators can manage show schedules and screenings.
-   **Order and Ticket Management**: Administrators can view and update the status of orders and tickets. Tickets can be exported in PDF format.
-   **User Management**: Administrators can view and manage user accounts, and assign staff roles.
-   **Cinema Room Management**: Administrators can add, update layouts, maintain, and delete theater rooms.
-   **Statistics**: Export statistics in Excel format for specified dates.
-   **Ticket Price Management**: Administrators can add and update ticket prices based on room types or applicable dates.
-   **Post Management**: Administrators can write and delete posts.
-   **Combo and Discount Code Management**: Administrators can add, update, and delete combos and discount codes.
-   **Other**: Manage sliders, categories, directors, and actors.

## Making Payments

---

The app is using VNPay, PayPal as a payment method, and is running is Development Mode, which means it doesn't actually withdraw any real money but you will have to use the following card details:

### with VNPay

```
Bank: NCB
Card Number: 9704198526191432198
Cardholder Name: NGUYEN VAN A
Expiration Date: 07/15
OTP Password: 123456
```

### with PayPal

```
Card number: 4032 0368 6909 1528
Expiry date: 05/2030
CCV: optional
```

## Technologies Used

---

### Front end

-   **React.js, Ant Design**: Used for building the user interface with a modern and responsive design.
-   **React Router**: Handles client-side routing for seamless navigation.
-   **TanStack/React Query**: Manages API calls and server state efficiently.
-   **Pusher**: Enables real-time functionality and live updates.
-   **Zxing/browser**: Handles QR code scanning in the browser.
-   **Swiper**: Used to create responsive sliders and carousels.
-   **CSS Modules**: For modular and scoped component styling.

### Back end

-   **Redis**: used for session management, supports real-time features, and stores tokens such as OTP.
-   **WebSocket**: enables two-way communication between the client and server in real-time.
-   **Pusher**: a service that uses WebSocket to broadcast real-time events.
-   **MySQL**: a relational database management system (RDBMS) used to store and manage data.

## Setup and Installation

1.**Setup and Installation**

```
https://github.com/ducmanh2503/DATN.git
```

2.**Install dependencies for both frontend**

```
cd DATN/Front-end/package.json
npm install
```

3.**Add .env inside backend/config:**

```
connect zalo with :
 0327427463 (Mạnh - Team Leader)
 0382681166 (Văn Member)
 0964907815 (Khánh Member)
 0793272770 (Phan anh Member)
 0326539886 (Dương Member)
```

## Usage

---

1.**Start the backend server:**

```
terminal laragon
cd DATN
cd backend
php artisan ser
```

2.**Start the frontend server**

```
cd DATN/Front-end/package.json
npm run dev

```

## Project Images

---

### Clients pages

#### Login

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20211957.png)

#### Home

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20212241.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20212337.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20212343.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20212350.png)

#### Playing Film

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20212407.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20212416.png)

#### Coming Film

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20212424.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20212432.png)

#### Forest

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20212443.png)

#### Booking

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20212520.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20212554.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20212633.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20212734.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20212812.png)

#### minigame

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20213309.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20213327.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20213320.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20220402.png)

#### User Profile

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20213158.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20213209.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20220357.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20213224.png)

### Admin pages

#### Statistics

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20213405.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20213547.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20213554.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20220745.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20220812.png)

#### Films management

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20213445.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20221445.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20213458.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20213525.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20214452.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20222631.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20221643.png)

#### Check in ticket

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20214035.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20214232.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20214242.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20214310.png)

#### Cinema rooms management

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20214507.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20214531.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20214542.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20214554.png)

#### Order management

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20214627.png)

#### User management

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20214658.png)
![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20214714.png)

#### Ticket price management

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20214610.png)

#### Discout Code management

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20214638.png)

#### Combos management

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20214618.png)

#### Article management

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20214633.png)

#### Slider management

![](./Front-end/public/imageFE/image-readme/Screenshot%202025-05-14%20214647.png)

---

✍🏻write by: payla232(DaoKhanh)
