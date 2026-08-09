import { Routes, Route } from 'react-router-dom';
import NavBar from '../components/NavBar';

import Menu from '../pages/Menu';
import CountrySelector from '../pages/CountrySelector';

import TeamList from '../pages/teams/TeamList';
import TeamForm from '../pages/teams/TeamForm';

import PlayerList from '../pages/players/PlayerList';
import PlayerForm from '../pages/players/PlayerForm';
import PlayerDiscipline from '../pages/discipline/PlayerDiscipline';

import VenueList from '../pages/venues/VenueList';
import VenueForm from '../pages/venues/VenueForm';

import TournamentList from '../pages/tournament/TournamentList';
import TournamentForm from '../pages/tournament/TournamentForm';
import TournamentDetail from '../pages/tournament/TournamentDetail';
import EditionDetail from '../pages/tournament/EditionDetail';

import MatchList from '../pages/matches/MatchList';
import MatchForm from '../pages/matches/MatchForm';
import MatchDetail from '../pages/matches/MatchDetail';

import OwnerList from '../pages/owners/OwnerList';
import OwnerForm from '../pages/owners/OwnerForm';

import BudgetList from '../pages/finance/BudgetList';
import FinancialList from '../pages/finance/FinancialList';
import ObjectiveList from '../pages/finance/ObjectiveList';

import TransferWindowList from '../pages/transfers/TransferWindowList';
import TransferList from '../pages/transfers/TransferList';
import TransferDetail from '../pages/transfers/TransferDetail';

export default function AppRouter() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/select-country" element={<CountrySelector />} />

        <Route path="/teams" element={<TeamList />} />
        <Route path="/teams/new" element={<TeamForm />} />
        <Route path="/teams/:id/edit" element={<TeamForm />} />

        <Route path="/players" element={<PlayerList />} />
        <Route path="/players/new" element={<PlayerForm />} />
        <Route path="/players/:id/edit" element={<PlayerForm />} />
        <Route path="/discipline" element={<PlayerDiscipline />} />

        <Route path="/venues" element={<VenueList />} />
        <Route path="/venues/new" element={<VenueForm />} />
        <Route path="/venues/:id/edit" element={<VenueForm />} />

        <Route path="/tournaments" element={<TournamentList />} />
        <Route path="/tournaments/new" element={<TournamentForm />} />
        <Route path="/tournaments/:id/edit" element={<TournamentForm />} />
        <Route path="/tournaments/:id" element={<TournamentDetail />} />
        <Route path="/editions/:seasonId" element={<EditionDetail />} />

        <Route path="/matches" element={<MatchList />} />
        <Route path="/matches/new" element={<MatchForm />} />
        <Route path="/matches/:id" element={<MatchDetail />} />

        <Route path="/owners" element={<OwnerList />} />
        <Route path="/owners/new" element={<OwnerForm />} />
        <Route path="/owners/:id/edit" element={<OwnerForm />} />

        <Route path="/budgets" element={<BudgetList />} />
        <Route path="/financials" element={<FinancialList />} />
        <Route path="/objectives" element={<ObjectiveList />} />

        <Route path="/transfer-windows" element={<TransferWindowList />} />
        <Route path="/transfers" element={<TransferList />} />
        <Route path="/transfers/:id" element={<TransferDetail />} />
      </Routes>
    </>
  );
}
