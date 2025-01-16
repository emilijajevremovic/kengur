import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { GameRequestComponent } from './components/game-request/game-request.component';
import { FriendRequestsComponent } from './components/friend-requests/friend-requests.component';
import { GameMathComponent } from './components/game-math/game-math.component';
import { GameInfComponent } from './components/game-inf/game-inf.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent }, 
    { path: 'register', component: RegisterComponent }, 
    { path: 'lobby', component: FriendRequestsComponent }, 
    { path: 'game-math', component: GameMathComponent }, 
    { path: 'game-informatics', component: GameInfComponent }, 
];
