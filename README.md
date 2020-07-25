# Tourism Reservation RestFul-API

Tourism is among the world’s rapidly growing sectors with its foreign exchange and employment generation for countries. Its remarkable economic and social phenomena can not be quantify. Tourism encompasses the activities of persons traveling and staying in places outside their usual environment for not more than one consecutive year for leisure, business, and other purposes **According to WTO (1993)**.

## Overview

This application is richly built with astonishing features such as rating, reviews, booking, email sending, online payment, Aggregation pipeline, and Geospatial Queries among others.

## API Endpoints

| Methods | Endpoints                                                | Access  |
| ------- | -------------------------------------------------------- | ------- |
| POST    | /api/v1/users/signup                                     | Public  |
| POST    | /api/v1/users/login                                      | Public  |
| POST    | /api/v1/users/forgotPassword                             | Public  |
| PATCH   | /api/v1/users/resetPassword                              | Public  |
| PATCH   | /api/v1/users/updateMyPassword                           | Private |
| GET     | /api/v1/users/:userId                                    | Private |
| GET     | /api/v1/users                                            | Private |
| GET     | /api/v1/users/me                                         | Private |
| PATCH   | /api/v1/users/updateMe                                   | Private |
| PATCH   | /api/v1/users/:userId                                    | Private |
| DELETE  | /api/v1/users/:userId                                    | Private |
| DELETE  | /api/v1/users/deleteMe                                   | Private |
| POST    | /api/v1/tours                                            | Private |
| GET     | /api/v1/tours                                            | Public  |
| GET     | /api/v1/tours/:tourId                                    | Public  |
| PATCH   | /api/v1/tours/:tourId                                    | Private |
| DELETE  | /api/v1/tours/:tourId                                    | Private |
| GET     | /api/v1/tours/top-5-cheap                                | Public  |
| GET     | /api/v1/tours/tour-stats                                 | Public  |
| GET     | /api/v1/tours/monthly-plan/:year                         | Private |
| GET     | /api/v1/tours-within/:distance/center/:latlng/unit/:unit | public  |
| GET     | /api/v1/distances/:latlng/unit/mi                        | Public  |
| POST    | /api/v1/reviews                                          | Private |
| GET     | /api/v1/reviews                                          | Private |
| GET     | /api/v1/reviews/:reviewId                                | Private |
| PATCH   | /api/v1/reviews/:reviewId                                | Private |
| DELETE  | /api/v1/reviews/:reviewId                                | Private |
| POST    | /api/v1/tours/:tourId/reviews                            | Private |
| GET     | /api/v1/tours/:tourId/reviews                            | Private |

# Contributing :computer:

You can fork the repository and send pull request or reach out easily to me via twitter :point_right: [Kater Akeren](https://twitter.com/katerakeren). If you discover a security vulnerability within the app, please :pray: create an issue. All security vulnerabilities will be promptly addressed and appreciated.

# License

**Natours** is an open-source curve for lovers :heart: of optimal and reusable codes. This project work is built and used with `GPL.3.0` licence. You are free to integrate the codes to your application to build optimal, sustainable and help many seasoned young and upcoming Node.js developers to write optimal codes and built real-world applications.
