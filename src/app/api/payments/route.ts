import { NextResponse } from 'next/server'
import { Payment } from '@/components/payments/types'

const payments: Payment[] = [
        {
          id: "m5gr84i9",
          amount: 316,
          status: "success",
          email: "ken99@example.com",
        },
        {
          id: "3u1reuv4",
          amount: 242,
          status: "success",
          email: "Abe45@example.com",
        },
        {
          id: "derv1ws0",
          amount: 837,
          status: "processing",
          email: "Monserrat44@example.com",
        },
        {
          id: "5kma53ae",
          amount: 874,
          status: "success",
          email: "Silas22@example.com",
        },
        {
          id: "bhqecj4p",
          amount: 721,
          status: "failed",
          email: "carmella@example.com",
        },
        {
          id: "a1b2c3d4",
          amount: 150,
          status: "success",
          email: "user1@example.com",
        },
        {
          id: "e5f6g7h8",
          amount: 200,
          status: "processing",
          email: "user2@example.com",
        },
        {
          id: "i9j0k1l2",
          amount: 300,
          status: "failed",
          email: "user3@example.com",
        },
        {
          id: "m3n4o5p6",
          amount: 450,
          status: "success",
          email: "user4@example.com",
        },
        {
          id: "q7r8s9t0",
          amount: 600,
          status: "success",
          email: "user5@example.com",
        },
        {
          id: "u1v2w3x4",
          amount: 750,
          status: "processing",
          email: "user6@example.com",
        },
        {
          id: "y5z6a7b8",
          amount: 800,
          status: "failed",
          email: "user7@example.com",
        },
        {
          id: "c9d0e1f2",
          amount: 900,
          status: "success",
          email: "user8@example.com",
        },
        {
          id: "g3h4i5j6",
          amount: 1000,
          status: "success",
          email: "user9@example.com",
        },
        {
          id: "k7l8m9n0",
          amount: 1100,
          status: "processing",
          email: "user10@example.com",
        },
        {
          id: "o1p2q3r4",
          amount: 1200,
          status: "failed",
          email: "user11@example.com",
        },
        {
          id: "s5t6u7v8",
          amount: 1300,
          status: "success",
          email: "user12@example.com",
        },
        {
          id: "w9x0y1z2",
          amount: 1400,
          status: "success",
          email: "user13@example.com",
        },
        {
          id: "a3b4c5d6",
          amount: 1500,
          status: "processing",
          email: "user14@example.com",
        },
        {
          id: "e7f8g9h0",
          amount: 1600,
          status: "failed",
          email: "user15@example.com",
        },
        {
          id: "i1j2k3l4",
          amount: 1700,
          status: "success",
          email: "user16@example.com",
        },
        {
          id: "m5n6o7p8",
          amount: 1800,
          status: "success",
          email: "user17@example.com",
        },
        {
          id: "q9r0s1t2",
          amount: 1900,
          status: "processing",
          email: "user18@example.com",
        },
        {
          id: "u3v4w5x6",
          amount: 2000,
          status: "failed",
          email: "user19@example.com",
        },
        {
          id: "y7z8a9b0",
          amount: 2100,
          status: "success",
          email: "user20@example.com",
        },
      ]

export function GET() {
  return NextResponse.json(payments)
}
