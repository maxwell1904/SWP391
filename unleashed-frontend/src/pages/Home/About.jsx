import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import superlogo from "../../assets/images/superlogo.png";
import Lottie from "lottie-react";
import FiveWhy from "../../assets/anim/5Why.json";
import nambuoc from "../../assets/anim/5buoc.json";

export function About() {
  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 px-4 md:px-40 py-10 items-center">
        <div className="AboutLeft md:col-span-2 space-y-10">
          <h1 className="font-bold text-3xl md:text-5xl font-poppins">
            About Our Store
          </h1>
          <p className="font-poppins text-base md:text-xl text-justify">
            Our store is an online platform created by Group 1 with the goal of
            fulfilling the requirements for the OJT. We focus on
            providing customers with a simple and convenient fashion shopping
            experience from the comfort of their homes. With a commitment to
            product quality and service, this platform not only offers stylish
            fashion products but also ensures customer satisfaction in every
            aspect of the shopping process.
          </p>
          <div className="btn bg-blueOcean rounded-lg w-48 md:w-56 h-14 md:h-20 text-white text-lg md:text-xl flex items-center justify-center">
            <Link to={"/"}>Explore More {">"}</Link>
          </div>
        </div>
        <div className="AboutRight flex justify-start mt-10 md:mt-0">
  <img src={superlogo} alt="Rockwear logo" className="w-1/2 md:w-full ml-20" />
</div>

      </div>
{/* 
      <div className="grid grid-cols-1 md:grid-cols-2 w-full bg-blueOcean">
        <div className="reason px-8 md:px-32 py-16 md:py-32">
          <Lottie animationData={nambuoc} loop={false} />
        </div>
        <div className="whyChoose text-white font-poppins flex flex-col justify-center px-8 md:px-0 py-16 md:py-0">
          <h1 className="font-bold text-3xl md:text-5xl">
            Your Satisfaction <br /> Is Guaranteed.
          </h1>
          <p className="text-lg md:text-xl mt-4">
            You will be able to find 5 most important things for your shopping
            experience here.
          </p>
        </div>
      </div> */}
{/* 
      <div className="fiveWhy px-8 md:px-32 py-16 md:py-32 bg-blueOcean">
        <Lottie animationData={nambuoc} loop={false} />
      </div> */}

      <div className="myTeam">
        {/* <div className="ourTeam bg-blueOcean text-center py-10 font-poppins font-bold text-white text-3xl md:text-5xl">
          <h1>OUR TEAM</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 place-items-center py-10 px-36 bg-green-to-white">
          {[
            {
              name: "Võ Trương Nhật Đăng",
              id: "CE181699",
              img: "https://avatars.githubusercontent.com/u/114787562?v=4",
            },
            {
              name: "Dương Nhật Anh",
              id: "CE181079",
              img: "https://avatars.githubusercontent.com/u/78785812?v=4",
            },
            {
              name: "Nguyễn Tấn Minh",
              id: "CE180111",
              img: "https://avatars.githubusercontent.com/u/137702779?v=4",
            },
            {
              name: "Lê Khắc Huy",
              id: "CE180311",
              img: "https://avatars.githubusercontent.com/u/129503367?v=4",
            },
            {
              name: "Mai Hoàng Ân",
              id: "CE180552",
              img: "https://avatars.githubusercontent.com/u/145850099?v=4",
            },
          ].map((member) => (
            <div
              key={member.id}
              className="info bg-white rounded-full font-bold font-inter text-center w-48 md:w-64 h-80 md:h-96 shadow-lg space-y-4 transition-transform transform hover:scale-105 hover:shadow-2xl hover:bg-gray-50"
            >
              <img
                src={member.img}
                alt={member.name}
                className="rounded-full object-fill p-3"
              />
              <h1>{member.name}</h1>
              <p>{member.id}</p>
            </div>
          ))}
        </div> */}
        {/* <div className="footerTeam font-poppins font-semibold text-lg md:text-2xl text-center py-16 md:py-44">
          <h1>
            Thanks for reading, hope you have a great experience here
          </h1>
        </div> */}
      </div>
    </MainLayout>
  );
}
