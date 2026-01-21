import React from 'react';
import SidebarFeed from '../../components/SidebarFeed';
import ConnectionSuggestions from '../../components/ConnectionSuggestions';
import RemindersBox from '../../components/RemindersBox';
import BadgeSystemBox from '../../components/BadgeSystemBox';
import PrintHistoryBox from '../../components/PrintHistoryBox';
import { auth } from '../../firebase';

const Home: React.FC = () => {
  const firstName = auth.currentUser?.displayName?.split(' ')[0] || "Estudante";

  return (
    <div className="flex flex-col gap-[30px] mt-0 animate-in fade-in duration-500">
      <div className="thoth-page-header">
        <h1 className="text-[28px] md:text-[32px] font-black text-slate-900 tracking-tight leading-tight">
          Bem-vindo, {firstName}
        </h1>
        <p className="text-slate-500 text-sm">Confira o que há de novo na Thoth.</p>
      </div>

      <section className="w-full min-h-[480px]">
        <SidebarFeed title="Feed" />
      </section>

      <div className="flex flex-col lg:flex-row gap-[30px] w-full">
        <div className="w-full lg:w-[660px]">
          <ConnectionSuggestions />
        </div>
        <div className="w-full lg:w-[315px]">
          <RemindersBox />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-[30px] w-full">
        <div className="w-full lg:w-[660px]">
          <BadgeSystemBox />
        </div>
        <div className="w-full lg:w-[315px]">
          <PrintHistoryBox />
        </div>
      </div>
    </div>
  );
};

export default Home;