import { NextRequest, NextResponse } from 'next/server';

export type VerifyReply = {
  code: string;
  detail: string;
};

const verifyEndpoint = `${process.env.NEXT_PUBLIC_WLD_API_BASE_URL}/api/v1/verify/${process.env.NEXT_PUBLIC_WLD_APP_ID}`;

export async function POST(req: NextRequest) {
  console.log("Received request to verify credential:\n", req.body);
  const reqBody = await req.json();
  const body = {
    nullifier_hash: reqBody.nullifier_hash,
    merkle_root: reqBody.merkle_root,
    proof: reqBody.proof,
    verification_level: reqBody.verification_level,
    action: reqBody.action,
    signal: reqBody.signal,
  };
  console.log("Sending request to World ID /verify endpoint:\n", body);

  try {
    const verifyRes = await fetch(verifyEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!verifyRes.ok) {
      throw new Error(`HTTP error! status: ${verifyRes.status}${verifyRes.statusText} body: ${await verifyRes.text()}`);
    }

    const wldResponse: VerifyReply = await verifyRes.json();
    console.log(
      `Received ${verifyRes.status} response from World ID /verify endpoint:\n`,
      wldResponse
    );

    if (verifyRes.status === 200) {
      console.log(
        "Credential verified! This action verified correctly!"
      );
      return new NextResponse(JSON.stringify({
        code: "success",
        detail: "This action verified correctly!",
      }), {
        status: verifyRes.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      return new NextResponse(JSON.stringify({
        code: wldResponse.code,
        detail: wldResponse.detail,
      }), {
        status: verifyRes.status,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error("Error when calling World ID /verify endpoint:\n", error);
    return new NextResponse(JSON.stringify({
      code: "error",
      detail: "An error occurred while verifying the credential.",
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
