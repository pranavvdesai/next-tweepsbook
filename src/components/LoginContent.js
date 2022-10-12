import { useState } from "react";
import { Link } from "next/link";
import firebase from "../firebase/firebase";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { toast } from "react-toastify";
import OtpInput from "react18-input-otp";
import Image from "next/image";
import { useRouter } from "next/router";

const LoginContent = (props) => {
  const { title, subTitle, button, image } = props;
  const [passwordShow, setPasswordShow] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [resend, setResend] = useState(false);
  const [timer, setTimer] = useState(60);
  const router = useRouter();

  const startTimer = () => {
    let counter = 60;
    const interval = setInterval(() => {
      counter--;
      if (counter >= 0) {
        setTimer(counter);
      }
      if (counter === 0) {
        setResend(false);
        window.grecaptcha.reset();
        window.recaptchaVerifier.clear();
        clearInterval(interval);
      }
    }, 1000);
  };

  const configureCaptcha = () => {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "sign-in-button",
      {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          onSignInSubmit();
          console.log(response + " Recaptcha verifier");
        },
        defaultCountry: "IN",
      }
    );
  };

  const onSignInSubmit = (e) => {
    e.preventDefault();
    const regex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
    if (phone === "") {
      toast.error("Please enter your phone number");
      return;
    } else if (!regex.test(phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    configureCaptcha();
    const phoneNumber = phone;
    const appVerifier = window.recaptchaVerifier;
    firebase
      .auth()
      .signInWithPhoneNumber(phoneNumber, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        toast.success("OTP has been sent");
        setResend(true);
        startTimer();
      })
      .catch((error) => {
        // Error; SMS not sent
        console.log(error.message);
        if (
          error.message ===
          "reCAPTCHA has already been rendered in this element"
        ) {
          router.reload();
          toast.error("Something went wrong, please try again");
        } else {
          toast.error("Error in sending OTP " + error.message);
        }
      });
  };

  const onVerifySubmit = (e) => {
    e.preventDefault();
    const code = otp;
    window.confirmationResult
      .confirm(code)
      .then((result) => {
        // User signed in successfully.
        const user = result.user;
        toast.success("User verified");
        router.push("/logged");
      })
      .catch((error) => {
        console.log(error);
        const errorCode = error.code.split("/").pop();
        toast.error("Error in verifying OTP " + errorCode);
      });
  };

  return (
    <section class="min-h-screen">
      <div class="px-6 h-full text-white">
        <div class="flex xl:justify-center lg:justify-between justify-center items-center flex-wrap h-full g-6">
          <div class="grow-0 shrink-1 md:shrink-0 basis-auto xl:w-6/12 lg:w-6/12 md:w-9/12 mb-12 md:mb-0">
            <Image
              src="/img.png"
              alt="Login"
              width={600}
              height={650}
              className="w-full"
            />
          </div>
          <div class="xl:ml-20 xl:w-5/12 lg:w-5/12 md:w-8/12 mb-12 md:mb-0">
            <h1 className="bold mb-4 text-2xl">LOGIN</h1>
            <form onSubmit={onSignInSubmit}>
              <div id="sign-in-button"> </div>
              <div class="flex mb-6">
                <PhoneInput
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={setPhone}
                  defaultCountry="IN"
                  international
                  containerStyle={{ backgroundColor: "black" }}
                  textInputStyle={{ backgroundColor: "black" }}
                  withDarkTheme
                  withShadow
                  className="form-control block w-full px-4 py-2 bg-white text-xl font-normal text-gray-700 bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:border-orange-600 focus:outline-none"
                />
                {resend ? (
                  <button
                    type="submit"
                    disabled
                    class="cursor-not-allowed inline-block ml-2 px-7 py-3 bg-orange-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-orange-700 hover:shadow-lg focus:bg-orange-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-orange-800 active:shadow-lg transition duration-150 ease-in-out"
                  >
                    Verify
                  </button>
                ) : (
                  <button
                    type="submit"
                    class="inline-block ml-2 px-7 py-3 bg-orange-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-orange-700 hover:shadow-lg focus:bg-orange-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-orange-800 active:shadow-lg transition duration-150 ease-in-out"
                  >
                    Verify
                  </button>
                )}
              </div>
            </form>
            <h1 className="bold mb-1 text-2xl">OTP</h1>
            <form onSubmit={onVerifySubmit}>
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                inputStyle={{
                  width: "100%",
                  height: "4rem",
                  margin: "1rem",
                  fontSize: "2rem",
                  borderRadius: 4,
                  border: "2px solid rgba(0,0,0,0.3)",
                }}
                className=" block w-full text-xl font-normal text-gray-700 bg-clip-padding transition ease-in-out m-0 focus:text-gray-700  focus:border-orange-600 focus:outline-none"
              />
              <button
                type="submit"
                class="inline-block mt-4 px-7 py-3 bg-orange-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-orange-700 hover:shadow-lg focus:bg-orange-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-orange-800 active:shadow-lg transition duration-150 ease-in-out"
              >
                Login
              </button>
            </form>
            {resend ? (
              <div className=" text-center">
                <p className="text-sm mt-4">
                  Resend OTP in <span className="text-orange-600">{timer}</span>{" "}
                  seconds
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginContent;
